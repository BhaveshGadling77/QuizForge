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
        (sum, q) => sum + (q.points || 0),
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

  async getAllQuizzesForAdmin() {
    const snapshot = await getDocs(
      query(this.quizCollection, orderBy("createdAt", "desc")),
    );

    return snapshot.docs.map((doc) => ({
      quizId: doc.id,
      title: doc.data().title,
      isActive: doc.data().isActive,
      totalQuestions: doc.data().totalQuestions,
      totalPoints: doc.data().totalPoints,
    }));
  }

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
