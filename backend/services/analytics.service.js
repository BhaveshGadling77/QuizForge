/**
 * Analytics Service
 * Handles analytics and statistics for admins
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

export class AnalyticsService {
  constructor(db) {
    this.db = db;
    this.resultsCollection = collection(db, process.env.COLLECTION_RESULTS);
    this.quizzesCollection = collection(db, process.env.COLLECTION_QUIZZES);
    this.usersCollection = collection(db, "users");
  }

  /**
   * Get quiz analytics
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>} Quiz analytics
   */
  async getQuizAnalytics(quizId) {
    try {
      // Get quiz details
      const quizRef = doc(this.quizzesCollection, quizId);
      const quizSnap = await getDoc(quizRef);

      if (!quizSnap.exists()) {
        throw new Error("Quiz not found");
      }

      const quiz = quizSnap.data();

      // Get all results for this quiz
      const q = query(this.resultsCollection, where("quizId", "==", quizId));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => doc.data());

      if (results.length === 0) {
        return {
          quizId,
          title: quiz.title,
          totalAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
          scoreDistribution: {},
        };
      }

      // Calculate statistics
      const scores = results.map((r) => r.score || 0);
      const totalAttempts = results.length;
      const averageScore = (
        scores.reduce((a, b) => a + b, 0) / totalAttempts
      ).toFixed(2);
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);

      // Calculate pass rate (assuming 50% is passing)
      const passingScore = (quiz.totalPoints || 100) * 0.5;
      const passCount = scores.filter((s) => s >= passingScore).length;
      const passRate = ((passCount / totalAttempts) * 100).toFixed(2);

      // Score distribution
      const distribution = this.calculateScoreDistribution(scores);

      return {
        quizId,
        title: quiz.title,
        description: quiz.description,
        totalAttempts,
        averageScore: parseFloat(averageScore),
        highestScore,
        lowestScore,
        passRate: parseFloat(passRate),
        scoreDistribution: distribution,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      };
    } catch (error) {
      throw new Error(`Failed to get quiz analytics: ${error.message}`);
    }
  }

  /**
   * Get all quizzes analytics for admin
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Array>} All quizzes with analytics
   */
  async getAllQuizzesAnalytics(adminId) {
    try {
      // Get all quizzes created by this admin
      const q = query(
        this.quizzesCollection,
        where("createdBy", "==", adminId),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return [];
      }

      const quizAnalytics = await Promise.all(
        snapshot.docs.map((doc) => this.getQuizAnalytics(doc.id)),
      );

      return quizAnalytics;
    } catch (error) {
      throw new Error(`Failed to get quizzes analytics: ${error.message}`);
    }
  }

  /**
   * Get student performance
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Array>} Student performance data
   */
  async getStudentPerformance(quizId) {
    try {
      const q = query(this.resultsCollection, where("quizId", "==", quizId));
      const snapshot = await getDocs(q);

      const results = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const result = doc.data();
          const userRef = doc(this.usersCollection, result.userId);
          const userSnap = await getDoc(userRef);

          return {
            resultId: doc.id,
            userName: userSnap.exists() ? userSnap.data().name : "Unknown",
            userEmail: userSnap.exists() ? userSnap.data().email : "Unknown",
            score: result.score,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctCount,
            attemptTime: result.timestamp,
            timeSpent: result.timeSpent,
          };
        }),
      );

      return results.sort((a, b) => (b.score || 0) - (a.score || 0));
    } catch (error) {
      throw new Error(`Failed to get student performance: ${error.message}`);
    }
  }

  /**
   * Get dashboard statistics
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(adminId) {
    try {
      // Total quizzes
      const quizzesQ = query(
        this.quizzesCollection,
        where("createdBy", "==", adminId),
      );
      const quizzesSnapshot = await getDocs(quizzesQ);
      const totalQuizzes = quizzesSnapshot.size;

      // Total students
      const studentsQ = query(
        this.usersCollection,
        where("role", "==", "student"),
      );
      const studentsSnapshot = await getDocs(studentsQ);
      const totalStudents = studentsSnapshot.size;

      // Total attempts
      const allQuizIds = quizzesSnapshot.docs.map((doc) => doc.id);
      let totalAttempts = 0;

      for (const quizId of allQuizIds) {
        const q = query(this.resultsCollection, where("quizId", "==", quizId));
        const snapshot = await getDocs(q);
        totalAttempts += snapshot.size;
      }

      // Average score
      const resultsQ = query(this.resultsCollection);
      const resultsSnapshot = await getDocs(resultsQ);
      const results = resultsSnapshot.docs.map((doc) => doc.data());

      const averageScore =
        results.length > 0
          ? (
              results.reduce((sum, r) => sum + (r.score || 0), 0) /
              results.length
            ).toFixed(2)
          : 0;

      return {
        totalQuizzes,
        totalStudents,
        totalAttempts,
        averageScore: parseFloat(averageScore),
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }

  /**
   * Calculate score distribution
   * @param {Array<number>} scores - Array of scores
   * @returns {Object} Score distribution (0-20%, 20-40%, etc.)
   */
  calculateScoreDistribution(scores) {
    const distribution = {
      "0-20%": 0,
      "20-40%": 0,
      "40-60%": 0,
      "60-80%": 0,
      "80-100%": 0,
    };

    scores.forEach((score) => {
      const percentage = (score / 100) * 100;
      if (percentage <= 20) distribution["0-20%"]++;
      else if (percentage <= 40) distribution["20-40%"]++;
      else if (percentage <= 60) distribution["40-60%"]++;
      else if (percentage <= 80) distribution["60-80%"]++;
      else distribution["80-100%"]++;
    });

    return distribution;
  }

  /**
   * Get question statistics
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Array>} Question statistics
   */
  async getQuestionStatistics(quizId) {
    try {
      const quizRef = doc(this.quizzesCollection, quizId);
      const quizSnap = await getDoc(quizRef);

      if (!quizSnap.exists()) {
        throw new Error("Quiz not found");
      }

      const quiz = quizSnap.data();
      const q = query(this.resultsCollection, where("quizId", "==", quizId));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => doc.data());

      if (results.length === 0) {
        return [];
      }

      // Calculate statistics for each question
      const questionStats = {};
      results.forEach((result) => {
        result.answers?.forEach((answer, idx) => {
          if (!questionStats[idx]) {
            questionStats[idx] = { correct: 0, incorrect: 0 };
          }

          if (answer.isCorrect) {
            questionStats[idx].correct++;
          } else {
            questionStats[idx].incorrect++;
          }
        });
      });

      return Object.entries(questionStats).map(([qIdx, stats]) => ({
        questionIndex: parseInt(qIdx),
        correctCount: stats.correct,
        incorrectCount: stats.incorrect,
        correctPercentage: ((stats.correct / results.length) * 100).toFixed(2),
      }));
    } catch (error) {
      throw new Error(`Failed to get question statistics: ${error.message}`);
    }
  }
}
