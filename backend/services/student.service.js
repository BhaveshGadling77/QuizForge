import {
  doc,
  getDoc,
  collection,
} from "firebase/firestore";

export class StudentService {
    
  constructor(db) {
    this.db = db;
    this.resultCollection = collection(
      db,
      process.env.COLLECTION_RESULTS
    );
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
    const resultId = `${quizId}_${studentId}`;
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
}
