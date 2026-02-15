import { doc, getDoc, getDocs, collection } from "firebase/firestore";

export class StudentService {
  constructor(db) {
    this.db = db;
    this.resultCollection = collection(db, process.env.COLLECTION_RESULTS);
  }

  /**
   * Fetch the authenticated student's result for a quiz
   *
   * Rules:
   * - Student can ONLY fetch their own result
   * - Result document is identified by quizId_userId
   *
   * @param {string} quizId - Firestore quiz ID
   * @param {string} studentId - User ID from JWT
   *
   * @returns {Promise<Object>} Result document
   *
   * @throws {Error} If result does not exist
   */
  async getMyResult(quizId, studentId) {
    const resultId = `result_${quizId}_${studentId}`;
    const resultRef = doc(this.resultCollection, resultId);

    const snap = await getDoc(resultRef);

    if (!snap.exists()) {
      throw new Error("Result not found");
    }

    const result = snap.data();

    return {
      resultId: snap.id,
      quizId: result.quizId,
      userId: result.userId,

      score: result.score,
      totalPoints: result.totalPoints,
      percentage: result.percentage,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,

      evaluationStatus: result.evaluationStatus,
      evaluatedAt: result.evaluatedAt,

      timeTakenSeconds: result.timeTakenSeconds,
      submittedAt: result.submittedAt,

      answers: result.answers,
    };
  }
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
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

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

    if (!attemptSnap.empty) {
      const err = new Error("Quiz already attempted");
      err.statusCode = 409;
      throw err;
    }

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
  /**
   * Submits a user's quiz attempt and evaluates answers atomically.
   *
   * This function:
   * - Validates quiz existence and active status
   * - Enforces quiz time limits (with optional auto-submit behavior)
   * - Prevents multiple attempts per user
   * - Automatically evaluates objective questions (MCQ, true/false, short-integer)
   * - Marks subjective answers for manual evaluation by admin
   * - Stores the result document in Firestore using a transaction
   *
   * Firestore transaction guarantees:
   * - Atomic submission
   * - Prevention of race conditions (double submission)
   * - Consistent scoring and evaluation status
   *
   * @param {string} quizId - Firestore ID of the quiz
   * @param {string} userId - Firestore ID of the submitting user
   * @param {Array<Object>} answers - Array of submitted answers
   * @param {number} timeTakenSeconds - Time taken by the user to complete the quiz
   *
   * @returns {Promise<Object>} Summary of the submission including:
   *  - score
   *  - totalPoints
   *  - percentage
   *  - correctCount
   *  - evaluationStatus ("evaluated" | "pending")
   *
   * @throws {Error} If:
   *  - Quiz does not exist or is inactive
   *  - Time limit is exceeded (when auto-submit is disabled)
   *  - User has already attempted the quiz
   *  - Submitted answers are invalid or malformed
   */
  async submitQuiz(quizId, userId, answers, timeTakenSeconds) {
    const quizRef = doc(this.quizCollection, quizId);
    const resultsRef = collection(this.db, process.env.COLLECTION_RESULTS);

    //check for the previous attempt of the user.

    const attemptQuery = query(
      resultsRef,
      where("quizId", "==", quizId),
      where("userId", "==", userId),
    );

    const attemptSnap = await getDocs(attemptQuery);

    if (!attemptSnap.empty) {
      const err = new Error("Quiz already attempted.");
      err.statusCode = 409;
      throw err;
    }
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
      });
      //determine evaluation status
      const evaluationStatus = hasManual ? "pending" : "evaluated";
      //build the result doc

      const resultDoc = {
        quizId,
        userId,
        score: totalScore,
        totalPoints: quiz.totalPoints,
        percentage:
          quiz.totalPoints > 0 ? (totalScore / quiz.totalPoints) * 100 : 0,
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
      const resultRef = doc(
        this.resultCollection,
        `result_${quizId}_${userId}`,
      ); //storing in the particular fashion for fast access.
      tx.set(resultRef, resultDoc);

      //summary for frontend.

      return {
        score: totalScore,
        totalPoints: quiz.totalPoints,
        percentage:
          quiz.totalPoints > 0 ? (totalScore / quiz.totalPoints) * 100 : 0,
        correctCount,
        evaluationStatus,
      };
    });
  }

  async getLeaderboard(quizId) {
    const snapshot = await this.db
      .collection(process.env.COLLECTION_RESULTS)
      .where("quizId", "==", quizId)
      .orderBy("score", "desc")
      .orderBy("timeTakenSeconds", "asc")
      .orderBy("submittedAt", "asc")
      .limit(15)
      .get();
    if (!snapshot) throw Error("data base error.");
    const leaderboard = {};

    snapshot.forEach((doc, index) => {
      const data = doc.data();

      leaderboard.push({
        rank: index + 1,
        userId: data.userId,
        studentName: data.userName,
        score: data.score,
        submittedAt: data.submittedAt,
      });
    });
    return leaderboard;
  }

  async getAllResultOfStudent(studentId) {
    const q = query(
      this.resultCollection,
      where("userId", "==", studentId),
      orderBy("submittedAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const result = doc.data();

      return {
        resultId: doc.id,
        quizId: result.quizId,
        score: result.score,
        totalPoints: result.totalPoints,
        percentage: result.percentage,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        submittedAt: result.submittedAt,
        timeTakenSeconds: result.timeTakenSeconds,
      };
    });
  }
}
