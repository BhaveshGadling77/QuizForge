import { transactionExpiredError } from "@google-cloud/datastore/build/src/request";
import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";

export class AdminService {
  constructor(db) {
    this.db = db;
    this.quizCollection = collection(db, process.env.COLLECTION_QUIZZES);
    this.resultCollection = collection(db.process.env.COLLECTION_RESULTS);
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
    const quizRef = doc(this.resultCollection);
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
}
