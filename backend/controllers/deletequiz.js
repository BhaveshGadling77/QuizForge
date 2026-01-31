import { db } from "../config/firebase-config.js";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export async function deleteQuiz(req, res) {
  try {
    const docIdToDelete = req.params.quizId;

    // get the doc ref
    const docRef = doc(db, process.env.COLLECTION_QUIZZES, docIdTodelete);

    //check if that doc exist in the collection
    const quizSnap = await getDoc(quizRef);

    //it does not exist
    if (!quizSnap.exists()) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }
    await deleteDoc(docRef);

    return res
      .status(200)
      .json({ msg: `doc with id: ${docIdToDelete} is deleted successfully.` });
  } catch (e) {
    console.error("Logout Error:", e);
    return res.json({ error: e.message });
  }
}
