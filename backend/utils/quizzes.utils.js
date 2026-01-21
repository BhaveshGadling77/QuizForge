import { db } from "../config/firebase-config.js";
import { addDoc, collection, doc, getDocs, getDoc } from "firebase/firestore";

export async function uploadQuiz({
  title,
  description,
  accessToken,
  totalPoints,
  totalQuestions,
  questions,
  visibility,
}) {
  try {
    //get the ref of the quizzes collection
    const quizzesRef = collection(db, process.env.COLLECTION_QUIZZES);
    //create the doc in that collection
    const quizDocRef = await addDoc(quizzesRef, {
      title,
      description,
      accessToken,
      visibility,
      totalPoints,
      totalQuestions,
    });

    console.log("Quiz doc id = ", quizDocRef.id);
    // logic behind adding questions in the
    const questionsRef = collection(quizDocRef, process.env.COLLECTION_QUESTIONS);
    // loop through each element and upload that in the doc
    for (let question of questions) {
      const questionDocRef = await addDoc(questionsRef, question);
      console.log(questionDocRef.id);
    }
  } catch (e) {
    console.log(e.message);
  }
}
