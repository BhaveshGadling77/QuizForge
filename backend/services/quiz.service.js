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

  // clean function to clean the underfined fields
  cleanData(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
  }

  // create quiz
  async createQuiz(quizData) {
    if (quizData.visibility === "private" && !quizData.accessToken) {
      throw new Error("Access token required for private quiz");
    }

    if (quizData.visibility === "private") {
      quizData.accessToken = await hashPassword(quizData.accessToken);
    }

    const payload = this.cleanData({
      ...quizData,
      accessToken: quizData.accessToken ?? null,
      createdAt: new Date(),
    });

    const docRef = await addDoc(this.quizCollection, payload);
    return docRef;
  }
  //update quiz
  async updateQuiz(quizId, updates) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) throw new Error("Quiz not found");

    const allowedFields = [
      "title",
      "description",
      "visibility",
      "isActive",
      "accessToken",
    ];

    let quizUpdates = {};

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

    quizUpdates = this.cleanData(quizUpdates);

    await updateDoc(quizRef, quizUpdates);
    return (await getDoc(quizRef)).data();
  }

  // delete quiz
  async deleteQuiz(quizId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) throw new Error("Quiz not found");

    await deleteDoc(quizRef);
  }

  // get all quizzes
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

  // get a quiz by id
  async getQuizById(quizId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) throw new Error("Quiz not found");

    return { quizId: quizSnap.id, ...quizSnap.data() };
  }

  // get questions
  async getQuestions(quizId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) throw new Error("Quiz not found");

    return quizSnap.data().questions ?? [];
  }

  // add question
  async addQuestion(quizId, questionData) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) throw new Error("Quiz not found");

    const quiz = quizSnap.data();
    const questions = quiz.questions ?? [];

    let newQuestionRaw = {
      questionId: `q_${Date.now()}`,

      questionType:
        questionData.questionType ??
        questionData.type ??
        "mcq",

      questionMd:
        questionData.questionMd ??
        questionData.text ??
        "",

      options:
        questionData.options ?? null,

      correctOptionIndex:
        questionData.correctOptionIndex ??
        questionData.correctOption ??
        null,

      correctAnswer:
        questionData.correctAnswer ?? null,

      points:
        typeof questionData.points === "number"
          ? questionData.points
          : 10,

      order: questions.length + 1,
      createdAt: new Date(),
    };

    // handle short type
    if (
      newQuestionRaw.questionType === "short-integer" ||
      newQuestionRaw.questionType === "short-subjective"
    ) {
      newQuestionRaw.options = null;
      newQuestionRaw.correctOptionIndex = null;
    }

    const newQuestion = this.cleanData(newQuestionRaw);

    console.log("Incoming:", questionData);
    console.log("Processed:", newQuestion);

    questions.push(newQuestion);

    const updatePayload = this.cleanData({
      questions,
      totalQuestions: questions.length,
      totalPoints: questions.reduce(
        (sum, q) => sum + (q.points ?? 0),
        0
      ),
    });

    await updateDoc(quizRef, updatePayload);

    return newQuestion.questionId;
  }

  // delete questions
  async deleteQuestion(quizId, questionId) {
    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) throw new Error("Quiz not found");

    const quiz = quizSnap.data();

    const questions = (quiz.questions ?? []).filter(
      (q) => q.questionId !== questionId
    );

    const updatePayload = this.cleanData({
      questions,
      totalQuestions: questions.length,
      totalPoints: questions.reduce(
        (sum, q) => sum + (q.points ?? 0),
        0
      ),
    });

    await updateDoc(quizRef, updatePayload);
  }
}