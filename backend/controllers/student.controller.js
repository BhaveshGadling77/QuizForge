import { db } from "../config/firebase.config.js";
import { comparePassword } from "../services/encrytion.service.js";
import { StudentService } from "../services/student.service.js";

const studentService = new StudentService(db);

//Student Specific Controllers.
export async function getActiveQuizzes(req, res) {
  try {
    const quizzes = await studentService.getActivePublicQuizzes();
    return res.status(200).json({ quizzes });
  } catch (e) {
    return res.status(500).json({ msg: "Failed to fetch quizzes" });
  }
}

export async function attemptQuiz(req, res) {
  try {
    let quizId = req.params.quizId;
    let userId = req.user.id;
    const quizData = await studentService.getQuizData(quizId, userId);
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
    const userId = req.user.userId; // from auth middleware
    const { answers, timeTakenSeconds } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ success: false, msg: "Answers must be provided as an array" });
    }

    if (timeTakenSeconds === undefined || isNaN(timeTakenSeconds)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid timeTakenSeconds" });
    }

    const summary = await studentService.submitQuiz(
      quizId,
      userId,
      answers,
      Number(timeTakenSeconds),
    );

    return res.status(200).json({
      success: true,
      summary,
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
    const userId = req.user.userid;

    const result = await studentService.getMyResult(quizId, userId);

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
// req.body = {accessToken: "..."}
export async function getPrivateQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const { accessToken } = req.body;
    const { userId } = req.user.userId;
    const quizData = await studentService.getQuizData(quizId, userId);
    
    const isMatch = await comparePassword(quizData.accessToken, accessToken);
    if (!isMatch) {

      return res.json({
        success: false,
        msg: "Wrong Access Token.",
      });
    }
    return res.json({
      success: true,
      quiz: quizData
    })
  } catch (e) {
    return res.json({
      success: true,
      message: e.message
    })
  }
}
