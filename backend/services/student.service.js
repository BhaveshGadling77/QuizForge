import { doc, getDoc, getDocs, collection, query, where, orderBy, limit, runTransaction } from "firebase/firestore";


export class StudentService {
  c// Add to StudentService constructor
  constructor(db) {
    this.db = db;
    this.resultCollection = collection(db, process.env.COLLECTION_RESULTS);
    this.quizCollection = collection(db, process.env.COLLECTION_QUIZZES);
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
    console.log(snapshot)
    return snapshot.docs.map((doc) => ({
      quizId: doc.id,
      ...doc.data(),
    }));
  }

  async getQuizData(quizId, userId) {
    // get the quiz reference
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    // check if quiz exists
    if (!quizSnap.exists()) {
      throw new Error("Quiz not Found");
    }

    // get the quiz data from the snapshot
    const quiz = quizSnap.data();

    if (!quiz.isActive) {
      throw new Error("Quiz is not active");
    }

    // check if the user already attempted the quiz
    const attemptQuery = query(
      collection(this.db, process.env.COLLECTION_RESULTS),
      where("quizId", "==", quizId),
      where("userId", "==", userId)
    );
    const attemptSnap = await getDocs(attemptQuery);

    if (!attemptSnap.empty) {
      const err = new Error("Quiz already attempted");
      err.statusCode = 409;
      throw err;
    }

    // fetch questions from the subcollection
    const questionsSnap = await getDocs(collection(quizRef, "questions"));
    const questions = questionsSnap.docs.map((doc) => {
      const q = doc.data();
      return {
        id: doc.id,
        question: q.questionMd,
        options: q.options,
        questionType: q.questionType,
        order: q.order ?? 0,
      };
    });

    return {
      duration: quiz.durationSeconds ?? 0,
      title: quiz.title ?? "",
      description: quiz.description ?? "",
      createdAt: quiz.createdAt ?? null,
      totalQuestions: questions.length,
      questions,
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
  async submitQuiz(quizId, userId, userName, email, answers, timeTakenSeconds) {
  const quizRef = doc(this.quizCollection, quizId);
  const resultsRef = collection(this.db, process.env.COLLECTION_RESULTS);

  //  STEP 1: Fetch questions BEFORE transaction
  const questionsRef = collection(
    this.db,
    process.env.COLLECTION_QUIZZES,
    quizId,
    "questions"
  );

  const questionSnap = await getDocs(questionsRef);

  if (questionSnap.empty) {
    throw new Error("No questions found");
  }

  const questionMap = {};
  questionSnap.forEach((doc) => {
    const q = doc.data();
    questionMap[q.questionId] = q;
  });

  // STEP 2: attempts
  const attemptQuery = query(
    resultsRef,
    where("quizId", "==", quizId),
    where("userId", "==", userId)
  );

  const attemptSnap = await getDocs(attemptQuery);
  const attemptNumber = attemptSnap.size + 1;

  //  STEP 3: transaction
  return await runTransaction(this.db, async (tx) => {
    const quizSnap = await tx.get(quizRef);

    if (!quizSnap.exists()) throw new Error("Quiz Not Found");

    const quiz = quizSnap.data();

    if (!quiz.isActive) throw new Error("Quiz is not active");

    if (quiz.timerEnabled && timeTakenSeconds > quiz.durationSeconds) {
      if (quiz.autoSubmit) {
        timeTakenSeconds = quiz.durationSeconds;
      } else {
        throw new Error("Time limit exceeded");
      }
    }

    let totalScore = 0;
    let correctCount = 0;
    let hasManual = false;

    const evaluatedAnswers = answers.map((ans) => {
      const question = questionMap[ans.questionId];

      if (!question) {
        throw new Error(`Invalid question: ${ans.questionId}`);
      }

      let isCorrect = null;
      let pointsEarned = null;

      if (question.questionType === "mcq" || question.questionType === "true-false") {
        isCorrect = ans.selectedOptionIndex == question.correctOptionIndex;
        pointsEarned = isCorrect ? question.points : 0;

        if (isCorrect) correctCount++;
        totalScore += pointsEarned;

      } else if (question.questionType === "short-integer") {
        isCorrect =
          Number(ans.submittedAnswer) === Number(question.correctAnswer);

        pointsEarned = isCorrect ? question.points : 0;

        if (isCorrect) correctCount++;
        totalScore += pointsEarned;

      } else {
        hasManual = true;
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

    const evaluationStatus = hasManual ? "pending" : "evaluated";

    const resultRef = doc(
      this.resultCollection,
      `result_${quizId}_${userId}_${attemptNumber}`
    );

    const resultDoc = {
      resultId: resultRef.id,
      quizId,
      userId,
      userName,
      email,
      score: totalScore,
      totalPoints: quiz.totalPoints,
      percentage:
        quiz.totalPoints > 0 ? (totalScore / quiz.totalPoints) * 100 : 0,
      correctCount,
      totalQuestions: Object.keys(questionMap).length,
      answers: evaluatedAnswers,
      evaluationStatus,
      evaluatedBy: null,
      evaluatedAt: null,
      attemptNumber,
      timeTakenSeconds,
      status: "submitted",
      submittedAt: Timestamp.now(),
    };

    tx.set(resultRef, resultDoc);

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

  // Replace getLeaderboard in student.service.js
  async getLeaderboard(quizId) {
    const resultsRef = collection(this.db, process.env.COLLECTION_RESULTS);
    const q = query(
      resultsRef,
      where("quizId", "==", quizId),
      orderBy("score", "desc"),
      orderBy("timeTakenSeconds", "asc"),
      limit(15)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        userId: data.userId,
        studentName: data.userName,
        score: data.score,
        submittedAt: data.submittedAt,
      };
    });
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
