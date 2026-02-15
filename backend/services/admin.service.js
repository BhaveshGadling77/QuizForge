import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";

export class AdminService {
  constructor(db) {
    this.db = db;
    this.quizCollection = collection(db, process.env.COLLECTION_QUIZZES);
    this.resultCollection = collection(db, process.env.COLLECTION_RESULTS);
  }
  /**
   * Evaluate a pending result (manual grading)
   * @param {string} resultId - Firestore ID of the result
   * @param {string} adminUserId - The admin performing the evaluation
   * @param {Array<{questionId: string, pointsEarned: number}>} scores - Array of points assigned per question
   * @returns Updated result summary
   */
  async evaluateResult(resultId, adminUserId, scores) {
    const resultRef = doc(this.resultCollection, resultId);
    return await runTransaction(this.db, async (tx) => {
      //fetch the result
      const resultSnap = await tx.get(resultRef);
      if (!resultSnap.exists()) {
        throw new Error("Result Not Found");
      }

      const result = resultSnap.data();

      if (result.evaluateStatus === "evaluated") {
        throw new Error("Result is Already Evaluated.");
      }
      //fetch the quiz to validate max point
      const quizRef = doc(this.quizCollection, result.quizId);

      const quizSnap = await tx.get(quizRef);

      if (!quizSnap.exists()) {
        throw new Error("Quiz Not found.");
      }
      const quiz = quizSnap.data();
      //build the questionMap

      const questionMap = {};
      quiz.questions.forEach((q) => {
        questionMap[q.questionId] = q;
      });

      let totalScore = 0;
      let correctCount = result.correctCount || 0;

      const updatedAnswers = result.answers.map((ans) => {
        //find the score for this question.
        const scoreEntry = scores.find((s) => s.questionId == ans.questionId);

        if (!scoreEntry) return ans; //leave auto graded ans as it is

        const question = questionMap[ans.questionId];
        if (!question) {
          throw new Error(`Question Not Found: ${ans.questionId}`);
        }

        //validate scores
        if (
          scoreEntry.pointsEarned < 0 ||
          scoreEntry.pointsEarned > question.pointsEarned
        ) {
          throw new Error(`Invalid points for question ${ans.questionId}`);
        }

        ans.pointsEarned = scoreEntry.pointsEarned;
        ans.isCorrect = true;

        totalScore += scoreEntry.pointsEarned;
        if (ans.isCorrect) correctCount++;

        return ans;
      });
      //recalculate the final result

      const updateResult = {
        ...result,
        answers: updatedAnswers,
        score: totalScore,
        percentage: (totalScore / quiz.totalPoints) * 100,
        correctCount,
        evaluationStatus: "evaluated",
        evaluatedBy: adminUserId,
        evaluatedAt: Timestamp.now(),
      };

      //save back
      tx.set(resultRef, updateResult);

      return {
        score: updateResult.score,
        totalPoints: updateResult.totalPoints,
        percentage: updateResult.percentage,
        correctCount: updateResult.correctCount,
        evaluationStatus: updateResult.evaluationStatus,
      };
    });
  }

  async publishQuiz(quizId) {
    const quizRef = doc(this.quizCollection, quizId);

    return await runTransaction(this.db, async (tx) => {
      const quizSnap = await tx.get(quizRef);

      if (!quizSnap.exists()) {
        throw new Error("Quiz not found");
      }

      const quiz = quizSnap.data();

      // validations before publishing
      if (quiz.isActive) {
        throw new Error("Quiz is already published");
      }

      if (!quiz.questions || quiz.questions.length === 0) {
        throw new Error("Cannot publish quiz without questions");
      }

      if (quiz.totalPoints <= 0) {
        throw new Error("Quiz total points must be greater than zero");
      }

      if (quiz.visibility === "private" && !quiz.accessToken) {
        throw new Error("Private quiz must have an access token");
      }

      tx.update(quizRef, {
        isActive: true,
        publishedAt: Timestamp.now(),
      });

      return {
        quizId,
        status: "published",
      };
    });
  }

  async unpublishQuiz(quizId) {
    const quizRef = doc(this.quizCollection, quizId);

    return await runTransaction(this.db, async (tx) => {
      const quizSnap = await tx.get(quizRef);

      if (!quizSnap.exists()) {
        throw new Error("Quiz not found");
      }

      const quiz = quizSnap.data();

      if (!quiz.isActive) {
        throw new Error("Quiz is already unpublished");
      }

      tx.update(quizRef, {
        isActive: false,
        unpublishedAt: Timestamp.now(),
      });

      return {
        quizId,
        status: "unpublished",
      };
    });
  }

  async getQuizzesWithPendingResults() {
    const resultsRef = collection(this.db, process.env.COLLECTION_RESULTS);

    // Query all results that are pending
    const q = query(resultsRef, where("evaluationStatus", "==", "pending"));
    const snapshot = await getDocs(q);

    // get the quiz which is pending.
    const quizIds = new Set();
    snapshot.docs.forEach((doc) => {
      quizIds.add(doc.data().quizId);
    });

    // fetch the title and description.
    const quizzes = [];
    for (const quizId of quizIds) {
      const quizRef = doc(this.db, process.env.COLLECTION_QUIZZES, quizId);
      const quizSnap = await getDoc(quizRef);
      if (quizSnap.exists()) {
        quizzes.push({
          quizId,
          title: quizSnap.data().title,
          description: quizSnap.data().description,
        });
      }
    }
    return quizzes;
  }

  /**
   * 
   * @param {string} quizId - Firestore ID of Quiz.
   * @returns {Array{result}}  docs
   */
  async getPendingResults(quizId) {
    const resultsRef = collection(this.db, process.env.COLLECTION_RESULTS);
    const q = query(
      resultsRef,
      where("quizId", "==", quizId),
      where("evaluationStatus", "==", "pending"), // we can remove this line if we want to show the result that are pending and not evaluated.
    );

    const snapshot = await getDocs(q);

    const pendingResults = snapshot.docs.map((doc) => ({
      resultId: doc.id,
      userId: doc.data().userId,
      submittedAt: doc.data().submittedAt,
      timeTakenSeconds: doc.data().timeTakenSeconds,
      answers: doc.data().answers, // to show short-subjective answers
    }));
    return pendingResults;
  }

  /**
   * 
   * @param {string} quizId - Firestore QuizId
   * @returns {Array<{results}>} docs
   */
  async getAllResultsForQuiz(quizId) {
    const resultsRef = collection(this.db, process.env.COLLECTION_RESULTS);

    const q = query(
      resultsRef,
      where("quizId", "==", quizId),
      orderBy("submittedAt", "desc"),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((resultDoc) => {
      const data = resultDoc.data();
      return {
        resultId: resultDoc.id,
        userId: data.userId,
        score: data.score,
        totalPoints: data.totalPoints,
        percentage: data.percentage,
        evaluationStatus: data.evaluationStatus,
        submittedAt: data.submittedAt,
        timeTakenSeconds: data.timeTakenSeconds,
      };
    });
  }
  /**
   * get result doc for the particular student
   * @param {string} quizId - Firestore QuizId
   * @param {string} userId - particular doc of student that admin wants to view.
   * @returns result doc  
   */
  async getResultForStudent(quizId, userId) {
    const resultId = `result_${quizId}_${userId}`;
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
      evaluatedBy: result.evaluatedBy,
      evaluatedAt: result.evaluatedAt,

      timeTakenSeconds: result.timeTakenSeconds,
      submittedAt: result.submittedAt,

      answers: result.answers,
    };
  }
}
