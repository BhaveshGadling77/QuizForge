import { db } from "../config/firebase-config.js";

export async function getActiveQuizzes(req, res) {
  try {
    const snapshot = await db
      .collection(process.env.COLLECTION_QUIZZES)
      .where("isActive", "==", true)
      .where("visibility", "==", "public")
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty()) {
      return res.status(200).json({
        success: true,
        quizzes: [],
        message: "No active Quizzes Available.",
      });
    }

    const quizzes = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        quizId: doc.id,
        title: data.title,
        description: data.description,
        totalPoints: data.totalPoints,
        totalQuestions: data.totalQuestions,
        visibility: data.visibility,
        createdAt: data.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (e) {
    console.error("Error Fetching the quizzes: ", e);

    return res.status(500).json({
      success: true,
      message: "Failed to fetch active quizzes.",
    });
  }
}
