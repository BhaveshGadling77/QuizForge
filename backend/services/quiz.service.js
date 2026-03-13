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
import { hashPassword } from "./encrytion.service.js";

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
    if (quizData.visibility == "private") {
      quizData.accessToken = hashPassword(quizData.accessToken)
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

}
