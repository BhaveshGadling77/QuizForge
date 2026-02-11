import { AdminService } from "../services/admin.service.js";
import { db } from "../config/firebase.config.js";

const adminService = new AdminService(db);

export async function getQuizzesWithPendingResults(req, res) {
  try {
    const quizzes = await quizService.getQuizzesWithPendingResults();
    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: e.message,
    });
  }
}

export async function getPendingResults(req, res) {
  try {
    const quizId = req.params.quizId;
    const resultDocs = await quizService.getPendingResults(quizId);
    return res.status(200).json({
      success: true,
      resultDocs,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: e.message,
    });
  }
}

export async function evaluateResult(req, res) {
  try {
    const adminUserId = req.user.userId;
    const { resultId } = req.params 
    const { scores } = req.body;
    const result = adminService.evaluateResult(resultId, adminUserId, scores)
    
    return res.status(200).json({
      success: true,
      message: "Data Saved Successfully.",
      data: result
    })
  } catch(e) {
    return res.status(500).json({
      success: false,
      message: e.message      
    })
  }
}

export async function publishQuiz(req, res) {
  try {
    const { quizId } = req.params;

    const result = await adminService.publishQuiz(quizId)

    return res.status(200).json({
      success: true,
      message: "Quiz Published Successfully.",
      data: result
    })
  } catch(e) {
    return res.status(400).json({
      success: false,
      message: e.message
    })
  }
}

export async function unpublishQuiz(req, res) {
  
  try {
    const { quizId } = req.params;
    const result = await adminService.unpublishQuiz(quizId)
    return res.status(200).json({
      success: true,
      message: "Quiz Unpublished Successfully.",
      data: result,
    })
  } catch(e) {
    return res.status(400).json({
      success:false,
      message: e.message
    })
  }
}

export async function getAllResultsForQuiz(req, res) {
  try {
    const { quizId } = req.params;

    const results = await adminService.getAllResultsForQuiz(quizId);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function getResultForStudent(req, res) {
  try {
    const { quizId, userId } = req.params;

    const result = await quizService.getResultForStudent(quizId, userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}
