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
  where,
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
  async getAllQuizzesForAdmin(adminId) {
      const q = query(
        this.quizCollection,
        where("createdBy", "==", adminId),
        orderBy("createdAt", "desc")
      );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      quizId: doc.id,
      title: doc.data().title,
      isActive: doc.data().isActive,
      totalQuestions: doc.data().totalQuestions,
      totalPoints: doc.data().totalPoints,
      createdAt: doc.data().createdAt
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
    const questionsRef = collection(this.quizCollection, quizId, "questions");

    const snapshot = await getDocs(questionsRef);

    return snapshot.docs.map((doc) => ({
      questionId: doc.id,
      ...doc.data(),
    }));
  }

  // add question
  async addQuestion(quizId, questionData) {
    const quizRef = doc(this.quizCollection, quizId);

    // create a collection inside collection.
    const questionsRef = collection(quizRef, "questions");

    const newQuestion = this.cleanData({
      questionType: questionData.questionType ?? questionData.type ?? "mcq",
      questionMd: questionData.questionMd ?? questionData.text ?? "",
      options: questionData.options ?? null,
      correctOptionIndex:
        questionData.correctOptionIndex ?? questionData.correctOption ?? null,
      correctAnswer: questionData.correctAnswer ?? null,
      points:
        typeof questionData.points === "number"
          ? questionData.points
          : 10,
      createdAt: new Date(),
    });

    // this creates a NEW DOCUMENT inside subcollection
    const docRef = await addDoc(questionsRef, newQuestion);

    // optional: update quiz stats
    const quizSnap = await getDoc(quizRef);
    const quiz = quizSnap.data();

    await updateDoc(quizRef, {
      totalQuestions: (quiz.totalQuestions ?? 0) + 1,
      totalPoints: (quiz.totalPoints ?? 0) + (newQuestion.points ?? 0),
    });

    return docRef.id;
  }

  // delete questions
  async deleteQuestion(quizId, questionId) {
    const questionRef = doc(
      this.quizCollection,
      quizId,
      "questions",
      questionId
    );

    const questionSnap = await getDoc(questionRef);
    const question = questionSnap.data();

    await deleteDoc(questionRef);

    const quizRef = doc(this.quizCollection, quizId);
    const quizSnap = await getDoc(quizRef);
    const quiz = quizSnap.data();

    await updateDoc(quizRef, {
      totalQuestions: Math.max((quiz.totalQuestions ?? 1) - 1, 0),
      totalPoints: Math.max(
        (quiz.totalPoints ?? 0) - (question.points ?? 0),
        0
      ),
    });
  }
}