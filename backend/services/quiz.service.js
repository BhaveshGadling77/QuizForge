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
} from "firebase/firestore";

export class QuizService {
  constructor(db) {
    this.quizCollection = collection(db, process.env.COLLECTION_QUIZZES);
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
        (sum, q) => sum + (q.question_id.points || 0),
        0
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

  //user specific methods
  async getActivePublicQuizzes() {
    const q = query(
      this.quizCollection,
      where("isActive", "==", true),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      quizId: doc.id,
      ...doc.data(),
    }));
  }
}
