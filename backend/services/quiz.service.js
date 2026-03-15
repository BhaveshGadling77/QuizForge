import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { hashPassword } from "./encrytion.service.js";

export class QuizService {
  constructor(db) {
    this.db = db;
    this.quizCollection = collection(db, process.env.COLLECTION_QUIZZES);
    this.resultCollection = collection(db, process.env.COLLECTION_RESULTS);
  }

  async createQuiz(quizData) {
    if (quizData.visibility === "private" && !quizData.accessToken) {
      throw new Error("Access token required for private quiz");
    }
    if (quizData.visibility === "private") {
      quizData.accessToken = await hashPassword(quizData.accessToken);
    }
    const docRef = await addDoc(this.quizCollection, {
      ...quizData,
      createdAt: new Date(),
    });
    return docRef;
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
        0
      );
    }

    await updateDoc(quizRef, quizUpdates);
    return (await getDoc(quizRef)).data();
  }

  async deleteQuiz(quizId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);
    if (!quizSnap.exists()) throw new Error("Quiz not found");
    await deleteDoc(quizRef);
  }

  async getAllQuizzesForAdmin() {
    const snapshot = await getDocs(
      query(this.quizCollection, orderBy("createdAt", "desc"))
    );
    return snapshot.docs.map((doc) => ({
      quizId: doc.id,
      title: doc.data().title,
      isActive: doc.data().isActive,
      totalQuestions: doc.data().totalQuestions,
      totalPoints: doc.data().totalPoints,
    }));
  }

  async getQuizById(quizId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);
    if (!quizSnap.exists()) throw new Error("Quiz not found");
    return { quizId: quizSnap.id, ...quizSnap.data() };
  }

  async getQuestions(quizId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);
    if (!quizSnap.exists()) throw new Error("Quiz not found");
    return quizSnap.data().questions ?? [];
  }

  async addQuestion(quizId, questionData) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);
    if (!quizSnap.exists()) throw new Error("Quiz not found");

    const quiz = quizSnap.data();
    const questions = quiz.questions ?? [];

    const newQuestion = {
      questionId: `q_${Date.now()}`,
      questionType: questionData.type ?? "mcq",
      questionMd: questionData.text,
      options: questionData.options,
      correctOptionIndex: questionData.correctOption,
      points: questionData.points ?? 10,
      order: questions.length + 1,
      createdAt: new Date(),
    };

    questions.push(newQuestion);

    await updateDoc(quizRef, {
      questions,
      totalQuestions: questions.length,
      totalPoints: questions.reduce((sum, q) => sum + (q.points ?? 0), 0),
    });

    return newQuestion.questionId;
  }

  async deleteQuestion(quizId, questionId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);
    if (!quizSnap.exists()) throw new Error("Quiz not found");

    const quiz = quizSnap.data();
    const questions = (quiz.questions ?? []).filter(
      (q) => q.questionId !== questionId
    );

    await updateDoc(quizRef, {
      questions,
      totalQuestions: questions.length,
      totalPoints: questions.reduce((sum, q) => sum + (q.points ?? 0), 0),
    });
  }
}