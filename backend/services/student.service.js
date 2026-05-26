import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

export class StudentService {
  c; // Add to StudentService constructor
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
    const q = query(
      this.resultCollection,
      where("quizId", "==", quizId),
      where("userId", "==", studentId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("Result not found");
    }

    const docSnap = snap.docs[0];
    const result = docSnap.data();

    return {
      resultId: docSnap.id,
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

  /**
   * Get all unique categories available in quizzes
   * Used for category filter dropdowns
   */
  async getCategories() {
    try {
      const q = query(
        this.quizCollection,
        where("isActive", "==", true),
        where("visibility", "==", "public"),
      );

      const snapshot = await getDocs(q);
      const categoriesSet = new Set();

      snapshot.docs.forEach((doc) => {
        const quiz = doc.data();
        if (quiz.category) {
          categoriesSet.add(quiz.category);
        }
      });

      return Array.from(categoriesSet).sort();
    } catch (error) {
      console.error("Get categories error:", error);
      return [];
    }
  }

  /**
   * Get quizzes with optional filtering
   * Supports filtering by category, difficulty, search, and sorting
   *
   * @param {Object} filters - Filter options
   * @param {string} filters.category - Filter by category
   * @param {string} filters.difficulty - Filter by difficulty (easy/medium/hard)
   * @param {string} filters.search - Search by title/description
   * @param {string} filters.sortBy - Sort field (createdAt, title, attempts)
   * @param {string} filters.sortOrder - asc or desc
   * @returns {Promise<Array>} Filtered and sorted quizzes
   */
  async getFilteredQuizzes(filters = {}) {
    try {
      const {
        category,
        difficulty,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      // Build base query
      let q = query(
        this.quizCollection,
        where("isActive", "==", true),
        where("visibility", "==", "public"),
      );

      // Fetch all quizzes (Firestore doesn't support multiple inequality filters)
      const snapshot = await getDocs(q);
      let quizzes = snapshot.docs.map((doc) => ({
        quizId: doc.id,
        ...doc.data(),
      }));

      // Apply category filter
      if (category) {
        quizzes = quizzes.filter((quiz) => quiz.category === category);
      }

      // Apply difficulty filter
      if (difficulty) {
        quizzes = quizzes.filter((quiz) => quiz.difficulty === difficulty);
      }

      // Apply search filter (title and description)
      if (search) {
        const searchLower = search.toLowerCase();
        quizzes = quizzes.filter(
          (quiz) =>
            (quiz.title && quiz.title.toLowerCase().includes(searchLower)) ||
            (quiz.description &&
              quiz.description.toLowerCase().includes(searchLower)),
        );
      }

      // Sort results
      quizzes.sort((a, b) => {
        let aVal, bVal;

        if (sortBy === "title") {
          aVal = (a.title || "").toLowerCase();
          bVal = (b.title || "").toLowerCase();
          return sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else if (sortBy === "attempts") {
          aVal = a.totalAttempts || 0;
          bVal = b.totalAttempts || 0;
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        } else {
          // Default: createdAt
          aVal = a.createdAt?.getTime?.() || 0;
          bVal = b.createdAt?.getTime?.() || 0;
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
      });

      return quizzes;
    } catch (error) {
      console.error("Get filtered quizzes error:", error);
      throw error;
    }
  }

  /**
   * Search quizzes by title and description
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching quizzes
   */
  async searchQuizzes(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.getActivePublicQuizzes();
    }

    return this.getFilteredQuizzes({ search: searchTerm });
  }

  /**
   * Get detailed result with answer breakdowns
   * Shows which questions were right/wrong with explanations
   *
   * @param {string} quizId - Quiz ID
   * @param {string} userId - Student ID
   * @returns {Promise<Object>} Detailed result with answer breakdown
   */
  async getDetailedResult(quizId, userId) {
    try {
      const resultId = `result_${quizId}_${userId}`;
      const resultRef = doc(this.resultCollection, resultId);
      const resultSnap = await getDoc(resultRef);

      if (!resultSnap.exists()) {
        throw new Error("Result not found");
      }

      const result = resultSnap.data();

      // Get quiz to fetch original question data
      const quizRef = doc(this.quizCollection, quizId);
      const quizSnap = await getDoc(quizRef);

      if (!quizSnap.exists()) {
        throw new Error("Quiz not found");
      }

      const quiz = quizSnap.data();

      // Fetch questions
      const questionsSnap = await getDocs(collection(quizRef, "questions"));

      const questionMap = {};
      questionsSnap.docs.forEach((doc) => {
        const q = doc.data();
        questionMap[q.questionId] = q;
      });

      // Build detailed answer breakdown
      const answerBreakdown = result.answers.map((ans) => {
        const question = questionMap[ans.questionId];

        return {
          questionId: ans.questionId,
          question: question?.questionMd || "Unknown",
          questionType: question?.questionType,
          options: question?.options || [],
          correctOptionIndex: question?.correctOptionIndex,
          correctAnswer: question?.correctAnswer,
          submittedAnswer: ans.submittedAnswer,
          selectedOptionIndex: ans.selectedOptionIndex,
          isCorrect: ans.isCorrect,
          pointsEarned: ans.pointsEarned,
          maxPoints: question?.points || 0,
          explanation: question?.explanation || null,
        };
      });

      // Group by correctness
      const correctAnswers = answerBreakdown.filter((a) => a.isCorrect);
      const incorrectAnswers = answerBreakdown.filter((a) => !a.isCorrect);
      const skippedAnswers = answerBreakdown.filter(
        (a) => a.submittedAnswer === null && a.selectedOptionIndex === null,
      );

      return {
        resultId: resultSnap.id,
        quizId: result.quizId,
        quizTitle: quiz.title,
        userId: result.userId,
        userName: result.userName,
        score: result.score,
        totalPoints: result.totalPoints,
        percentage: result.percentage,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        skippedCount: skippedAnswers.length,
        incorrectCount: incorrectAnswers.length,
        timeTakenSeconds: result.timeTakenSeconds,
        evaluationStatus: result.evaluationStatus,
        submittedAt: result.submittedAt,
        answerBreakdown,
        correctAnswers,
        incorrectAnswers,
        skippedAnswers,
      };
    } catch (error) {
      console.error("Get detailed result error:", error);
      throw error;
    }
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

    const attemptQuery = query(
      collection(this.db, process.env.COLLECTION_RESULTS),
      where("quizId", "==", quizId),
      where("userId", "==", userId),
    );
    const attemptSnap = await getDocs(attemptQuery);

    const alreadyAttempted = !attemptSnap.empty;

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
      visibility: quiz.visibility ?? "public",
      accessToken: quiz.accessToken ?? null,
      createdAt: quiz.createdAt ?? null,
      totalQuestions: questions.length,
      alreadyAttempted,
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
      "questions",
    );

    const questionSnap = await getDocs(questionsRef);

    if (questionSnap.empty) {
      throw new Error("No questions found");
    }

    const questionMap = {};

    questionSnap.forEach((questionDoc) => {
      questionMap[questionDoc.id] = {
        questionId: questionDoc.id,
        ...questionDoc.data(),
      };
    });
    // STEP 2: attempts
    const attemptQuery = query(
      resultsRef,
      where("quizId", "==", quizId),
      where("userId", "==", userId),
    );
    console.log(questionMap);

    const attemptSnap = await getDocs(attemptQuery);
    if (!attemptSnap.empty) {
      throw new Error("Quiz already attempted");
    }
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

        if (
          question.questionType === "mcq" ||
          question.questionType === "true-false"
        ) {
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
        `result_${quizId}_${userId}_${attemptNumber}`,
      );

      const resultDoc = {
        resultId: resultRef.id,
        quizId,
        title: quiz.title,
        totalQuestions: Object.keys(questionMap).length,
        totalPoints: quiz.totalPoints,
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
        resultId: resultRef.id,
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
      limit(15),
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


  /**
   * Record quiz attempt start time
   * Used to validate timer and track attempt history
   *
   * @param {string} quizId - Quiz ID
   * @param {string} userId - Student ID
   * @returns {Promise<Object>} Attempt metadata
   */
  async recordAttemptStart(quizId, userId) {
    try {
      const attemptId = `attempt_${quizId}_${userId}_${Date.now()}`;
      const attemptRef = doc(collection(this.db, "quiz_attempts"), attemptId);

      const attemptData = {
        id: attemptId,
        quizId,
        userId,
        startedAt: new Date(),
        status: "in_progress",
      };

      await addDoc(collection(this.db, "quiz_attempts"), {
        ...attemptData,
      });

      return attemptData;
    } catch (error) {
      console.error("Record attempt start error:", error);
      throw error;
    }
  }

  /**
   * Get all attempts for a student (for history/dashboard)
   * Shows all quiz attempts with scores and dates
   *
   * @param {string} userId - Student ID
   * @param {number} limit - Max results (default 20)
   * @returns {Promise<Array>} Array of attempt records
   */
  async getStudentAttemptHistory(userId, limitNum = 20) {
    try {
      const q = query(
        this.resultCollection,
        where("userId", "==", userId),
        orderBy("submittedAt", "desc"),
        limit(limitNum),
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const result = doc.data();
        return {
          resultId: doc.id,
          quizId: result.quizId,
          quizTitle: result.quizSnapshot?.title || "Unknown Quiz",
          score: result.score,
          totalPoints: result.totalPoints,
          percentage: result.percentage,
          correctCount: result.correctCount,
          totalQuestions: result.totalQuestions,
          timeTakenSeconds: result.timeTakenSeconds,
          submittedAt: result.submittedAt,
          evaluationStatus: result.evaluationStatus,
          attemptNumber: result.attemptNumber || 1,
        };
      });
    } catch (error) {
      console.error("Get attempt history error:", error);
      throw error;
    }
  }

  /**
   * Get attempt statistics for a student
   * Calculates average score, total attempts, etc.
   *
   * @param {string} userId - Student ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStudentStatistics(userId) {
    try {
      const results = await this.getStudentAttemptHistory(userId, 100); // Get more for accurate stats

      if (results.length === 0) {
        return {
          totalAttempts: 0,
          averageScore: 0,
          averagePercentage: 0,
          highestScore: 0,
          lowestScore: 0,
          totalQuizzesAttempted: 0,
          averageTimeSeconds: 0,
        };
      }

      const totalAttempts = results.length;
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const averageScore = totalScore / totalAttempts;
      const averagePercentage =
        results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts;
      const scores = results.map((r) => r.score);
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const uniqueQuizzes = new Set(results.map((r) => r.quizId)).size;
      const averageTimeSeconds = Math.round(
        results.reduce((sum, r) => sum + r.timeTakenSeconds, 0) / totalAttempts,
      );

      return {
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        highestScore,
        lowestScore,
        totalQuizzesAttempted: uniqueQuizzes,
        averageTimeSeconds,
      };
    } catch (error) {
      console.error("Get student statistics error:", error);
      throw error;
    }
  }

  /**
   * Get detailed quiz history with pagination
   * @param {string} userId - Student ID
   * @param {number} pageSize - Items per page
   * @param {number} pageNumber - Page number (1-indexed)
   */
  async getQuizHistoryPaginated(userId, pageSize = 10, pageNumber = 1) {
    try {
      const q = query(
        this.resultCollection,
        where("userId", "==", userId),
        orderBy("submittedAt", "desc"),
        limit(pageNumber * pageSize),
      );

      const snapshot = await getDocs(q);
      const allResults = snapshot.docs.map((doc) => {
        const result = doc.data();
        return {
          resultId: doc.id,
          quizId: result.quizId,
          quizTitle: result.quizSnapshot?.title || "Unknown Quiz",
          score: result.score,
          totalPoints: result.totalPoints,
          percentage: result.percentage,
          correctCount: result.correctCount,
          totalQuestions: result.totalQuestions,
          timeTakenSeconds: result.timeTakenSeconds,
          submittedAt: result.submittedAt,
          evaluationStatus: result.evaluationStatus,
        };
      });

      const startIndex = (pageNumber - 1) * pageSize;
      const paginatedResults = allResults.slice(
        startIndex,
        pageNumber * pageSize,
      );

      return {
        data: paginatedResults,
        totalCount: allResults.length,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(allResults.length / pageSize),
      };
    } catch (error) {
      console.error("Get paginated history error:", error);
      throw error;
    }
  }
}
