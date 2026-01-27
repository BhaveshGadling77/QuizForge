import { db } from "../config/firebase-config.js"; // your Firebase setup
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export async function updateQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const updates = req.body;

    const quizRef = doc(db, process.env.COLLECTION_QUIZZES, quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
      return res.status(404).json({ msg: "Quiz not found." });
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
      if (updates[field] !== undefined) quizUpdates[field] = updates[field];
    });

    // Update Questions

    if (updates.questions) {
      quizUpdates.questions = updates.questions;

      quizUpdates.totalQuestions = updates.questions.length;
      quizUpdates.totalPoints = updates.questions.reduce(
        (sum, q) => sum + (q.question_id.points || 0),
        0,
      );
    }

    await updateDoc(quizRef, quizUpdates);

    const updatedQuiz = await getDoc(quizRef);

    return res.status(200).json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz.data(),
    });
  } catch (error) {
    console.error("Update Quiz Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
