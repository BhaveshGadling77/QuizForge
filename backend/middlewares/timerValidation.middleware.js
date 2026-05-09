import { StudentService } from "../services/student.service.js";
import { db } from "../config/firebase.config.js";

const studentService = new StudentService(db);

/**
 * Middleware to validate quiz timer on submission
 * Prevents timer manipulation by comparing submitted time with server-calculated time
 *
 * Usage: router.post("/quizzes/:quizId/submit", authenticateToken, validateQuizTimer, submitQuiz);
 */
export async function validateQuizTimer(req, res, next) {
  try {
    const { quizId } = req.params;
    const { timeTakenSeconds } = req.body;
    const userId = req.user?.id;

    if (!quizId || !userId) {
      return res.status(400).json({
        success: false,
        msg: "Quiz ID or User ID missing",
      });
    }

    // Get quiz to check timer settings
    const { db } = studentService;
    const { collection, doc, getDoc } = await import("firebase/firestore");

    const quizRef = doc(
      collection(db, process.env.COLLECTION_QUIZZES || "quizzes"),
      quizId,
    );
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
      return res.status(404).json({
        success: false,
        msg: "Quiz not found",
      });
    }

    const quiz = quizSnap.data();

    // If timer is not enabled, skip validation
    if (!quiz.timerEnabled) {
      return next();
    }

    // Check if submitted time exceeds quiz duration (with 10 second buffer for network delay)
    const allowedTime = quiz.durationSeconds + 10;

    if (timeTakenSeconds > allowedTime) {
      // Log suspicious activity for later review
      console.warn(
        `Timer violation detected for user ${userId} on quiz ${quizId}. Submitted: ${timeTakenSeconds}s, Allowed: ${quiz.durationSeconds}s`,
      );

      // If auto-submit is enabled, cap the time to quiz duration
      if (quiz.autoSubmit) {
        req.body.timeTakenSeconds = quiz.durationSeconds;
        req.timerValidated = true;
        return next();
      }

      // If auto-submit is disabled, reject the submission
      return res.status(400).json({
        success: false,
        msg: "Time limit exceeded. Submission rejected.",
        code: "TIME_LIMIT_EXCEEDED",
      });
    }

    req.timerValidated = true;
    next();
  } catch (error) {
    console.error("Timer validation error:", error);
    // Don't block submission on validation error, but log it
    req.timerValidated = false;
    next();
  }
}
