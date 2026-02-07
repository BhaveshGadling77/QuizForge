import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

export class QuizService {
  constructor(db) {
    this.db = db;
    this.quizCollection = collection(db, process.env.COLLECTION_QUIZZES);
    this.resultCollection = collection(db, process.env.COLLECTION_RESULTS);
  }
  //admin specific methods
  async createQuiz(quizData) {
    if (quizData.visibility === "private" && !quizData.accessToken) {
      throw new Error("Access token required for private quiz");
    }

    await addDoc(this.quizCollection, {
      ...quizData,
      createdAt: new Date(),
    });
  }

  async updateQuiz(quizId, updates) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
      throw new Error("Quiz not found");
    }

    const allowedFields = [
      "title",
      "description",
      "visibility",
      "isActive",
      "accessToken",
    ];

    const quizUpdates = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        quizUpdates[field] = updates[field];
      }
    });

    if (updates.questions) {
      quizUpdates.questions = updates.questions;
      quizUpdates.totalQuestions = updates.questions.length;
      quizUpdates.totalPoints = updates.questions.reduce(
        (sum, q) => sum + (q.question_id.points || 0),
        0,
      );
    }

    await updateDoc(quizRef, quizUpdates);
    return (await getDoc(quizRef)).data();
  }

  async deleteQuiz(quizId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
      throw new Error("Quiz not found");
    }

    await deleteDoc(quizRef);
  }

  //user specific methods
  async getActivePublicQuizzes() {
    const q = query(
      this.quizCollection,
      where("isActive", "==", true),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      quizId: doc.id,
      ...doc.data(),
    }));
  }

  async getQuizData(quizId, userId) {
    //get the quiz reference
    const quizRef = this.db.collection(this.quizCollection).doc(quizId);

    const quizSnap = await quizRef.get();

    //get the snapshot of the quiz
    if (!quizSnap) {
      throw new Error("Quiz not Found");
    }

    //get the quiz data from the snapshot
    const quiz = quizSnap.data();

    if (!quiz.isActive) {
      throw new Error("Quiz is not active");
    }

    //check if the the user already attempted the quiz
    const attemptSnap = await this.db
      .collection(this.quizCollection)
      .where("quizId", "==", quizId)
      .where("userId", "==", userId)
      .get();

    if (!attemptSnap.empty()) throw new Error("Quiz is already attempted.");

    return {
      id: quizId,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map((q) => ({
        id: q.questionId,
        question: q.questionMd,
        options: q.options,
        questionType: q.questionType,
        order: q.order,
      })),
    };
  }

  async submitQuiz(quizId, userId, answers, timeTakenSeconds) {
    const quizRef = doc(this.quizCollection, quizId);
    const resultsRef = collection(this.db, process.env.COLLECTION_RESULTS);

    return await runTransaction(this.db, async (tx) => {
      //fetch the quiz

      const quizSnap = await tx.get(quizRef);

      if (!quizSnap.exists()) {
        throw new Error("Quiz Not Found");
      }

      const quiz = quizSnap.data();

      //quiz Validation.
      if (!quiz.isActive) throw new Error("Quiz is not active");
      if (quiz.timerEnabled && timeTakenSeconds > quiz.durationSeconds) {
        if (quiz.autoSubmit) {
          // allow, but mark timeTakenSeconds as max
          timeTakenSeconds = quiz.durationSeconds;
        } else {
          throw new Error("Time limit exceeded");
        }
      }


      //check for the previous attempt of the user.

      const attemptQuery = query(
        resultsRef,
        where("quizId", "==", quizId),
        where("userId", "==", userId),
      );

      const attemptSnap = await getDocs(attemptQuery);

      if (attemptSnap.empty()) {
        throw new Error("Quiz is Already attempted.");
      }

      //building question map
      const questionMap = {};
      quiz.questions.map((q) => {
        questionMap[q.questionId] = q;
      });

      let totalScore = 0;
      let correctCount = 0;
      let hasManual = false;

      //evaluate the answers

      const evaluatedAnswers = answers.map((ans) => {
        const question = questionMap[ans.questionId];
        if (!question)
          throw new Error(`Invalid question submitted: ${ans.questionId}`);

        let isCorrect = null;
        let pointsEarned = null;

        switch (question.questionType) {
          case "mcq":
          case "true-false":
            isCorrect = ans.selectedOptionIndex == question.correctOptionIndex;
            pointsEarned = isCorrect ? question.points : 0;

            if (isCorrect) {
              correctCount++;
            }
            totalScore += pointsEarned;
            break;

          case "short-integer":
            if (
              ans.submittedAnswer === undefined ||
              isNaN(ans.submittedAnswer)
            ) {
              throw new Error(
                `Invalid short-integer answer for question ${ans.questionId}`,
              );
            }
            isCorrect =
              Number(ans.submittedAnswer) === Number(question.correctAnswer);
            pointsEarned = isCorrect ? question.points : 0;
            if (isCorrect) correctCount++;

            totalScore += pointsEarned;
            break;

          case "short-subjective":
            hasManual = true;
            pointsEarned = null;
            isCorrect = null;
            break;

          default:
            throw new Error(
              `Unsupported question type: ${question.questionType}`,
            );
        }
        return {
          questionId: ans.questionId,
          selectedOptionIndex: ans.selectedOptionIndex ?? null,
          submittedAnswer: ans.submittedAnswer ?? null,
          isCorrect,
          pointsEarned,
          maxPoints: question.points,
        };

        //determine evaluation status
        const evaluationStatus = hasManual ? "pending" : "evaluated";
        //build the result doc

        const resultDoc = {
          quizId,
          userId,
          score: totalScore,
          totalPoints: quiz.totalPoints,
          percentage: (totalScore / quiz.totalPoints) * 100,
          correctCount,
          totalQuestions: quiz.totalQuestions,
          answers: evaluatedAnswers,
          evaluationStatus,
          evaluatedBy: null,
          evaluatedAt: null,
          timeTakenSeconds,
          submittedAt: Timestamp.now(),
        };

        //write result in transaction
        const resultRef = doc(this.resultCollection);
        tx.set(resultRef, resultDoc)
        
        //summary for frontend.
        
        return {
          score: totalScore,
          totalPoints: quiz.totalPoints,
          percentage: (totalScore / quiz.totalPoints) * 100,
          correctCount,
          evaluationStatus
        }
      });
    });
  }
}
