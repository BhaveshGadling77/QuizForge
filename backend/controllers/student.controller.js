import { db } from "../config/firebase.config.js";
import { decryptToken } from "../services/encrytion.service.js";
import { StudentService } from "../services/student.service.js";

const studentService = new StudentService(db);

//Student Specific Controllers.
export async function getActiveQuizzes(req, res) {
  try {
    // console.log("student hit this route.") //debug
    const quizzes = await studentService.getActivePublicQuizzes();
    return res.status(200).json({ quizzes });
  } catch (e) {
    return res.status(500).json({ msg: e.message });
  }
}


export async function attemptQuiz(req, res) {
  try {
    let quizId = req.params.quizId;
    let userId = req.user.id;
    const quizData = await studentService.getQuizData(quizId, userId);
    
    // Do not leak the hashed token to the frontend
    delete quizData.accessToken;

    if (quizData.visibility === "private") {
      // For private quizzes, do not send questions yet!
      delete quizData.questions;
      return res.status(200).json({
        success: true,
        quiz: quizData,
        isPrivate: true,
      });
    }

    return res.status(200).json({
      success: true,
      quiz: quizData,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: e.message,
    });
  }
}



export async function submitQuiz(req, res) {
  try {
    const quizId = req.params.quizId;

    const userId = req.user?.id;
    const userName = req.user?.name;
    const email = req.user?.email;

    if (!quizId || !userId) {
      return res.status(400).json({
        success: false,
        msg: "quizId or userId missing",
      });
    }

    const { answers, timeTakenSeconds } = req.body;
    // console.log(answers)

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        msg: "Answers must be array",
      });
    }

    const summary = await studentService.submitQuiz(
      quizId,
      userId,
      userName,
      email,
      answers,
      Number(timeTakenSeconds),
    );

    // console.log(summary);
    return res.status(200).json({
      success: true,
      summary,
      quizId
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: e.message,
    });
  }
}
export async function getMyResult(req, res) {
  try {
    const { quizId } = req.params;
    // console.log(quizId) //debug
    const userId = req.user.id;
    // console.log(userId) //debug
    const result = await studentService.getDetailedResult(quizId, userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Get detailed result with answer breakdowns
 * Shows correct/incorrect/skipped questions with explanations
 */
export async function getDetailedResult(req, res) {
  try {
    const { quizId } = req.params;
    const userId = req.user?.id;

    if (!quizId || !userId) {
      return res.status(400).json({
        success: false,
        msg: "quizId or userId missing",
      });
    }

    const result = await studentService.getDetailedResult(quizId, userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
}

export async function getLeaderboard(req, res) {
  try {
    const { quizId } = req.params;
    const data = await studentService.getLeaderboard(quizId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (e) {
    return res.status(404).json({
      success: true,
      message: e.message,
    });
  }
}

/**
 * Get student's attempt history for their dashboard
 * Shows all quizzes they've attempted with scores
 */
export async function getAttemptHistory(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        msg: "User ID missing",
      });
    }

    const history = await studentService.getStudentAttemptHistory(userId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
}

/**
 * Get student's overall statistics (for dashboard)
 * Average score, total attempts, highest score, etc.
 */
export async function getStudentStats(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        msg: "User ID missing",
      });
    }

    const stats = await studentService.getStudentStatistics(userId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
}

/**
 * Get paginated quiz history
 */
export async function getHistoryPaginated(req, res) {
  try {
    const userId = req.user?.id;
    const { pageSize = 10, pageNumber = 1 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        msg: "User ID missing",
      });
    }

    const result = await studentService.getQuizHistoryPaginated(
      userId,
      parseInt(pageSize),
      parseInt(pageNumber),
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
}
// req.body = {accessToken: "..."}
/**
 * Verify access token for private quiz and return quiz data
 * Private quizzes require an access token to be attempted
 */
export async function getPrivateQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const { accessToken } = req.body;
    const userId = req.user?.id;

    if (!quizId || !userId) {
      return res.status(400).json({
        success: false,
        msg: "quizId or userId missing",
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        msg: "Access token required",
      });
    }

    // Get quiz data for the user
    const quizData = await studentService.getQuizData(quizId, userId);

    // Check if quiz is private
    if (quizData.visibility !== "private") {
      return res.status(400).json({
        success: false,
        msg: "This quiz is not private. No access token needed.",
      });
    }

    // Verify the access token matches (compare against AES-decrypted stored token)
    let isMatch = false;
    try {
      const storedPlain = decryptToken(quizData.accessToken);
      isMatch = accessToken === storedPlain;
    } catch (e) {
      // Fallback: if token cannot be decrypted (legacy data), reject
      isMatch = false;
    }

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        msg: "Invalid access token",
      });
    }
    
    delete quizData.accessToken;
    return res.status(200).json({
      success: true,
      msg: "Access granted",
      quiz: quizData,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: e.message,
    });
  }
}
