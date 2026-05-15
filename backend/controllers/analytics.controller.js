/**
 * Analytics Controller
 * Handles analytics endpoints for admins
 */

import { db } from "../config/firebase.config.js";
import { AnalyticsService } from "../services/analytics.service.js";

const analyticsService = new AnalyticsService(db);

/**
 * Get quiz analytics
 */
export async function getQuizAnalytics(req, res) {
  try {
    const { quizId } = req.params;

    const analytics = await analyticsService.getQuizAnalytics(quizId);

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get all quizzes analytics
 */
export async function getAllQuizzesAnalytics(req, res) {
  try {
    const adminId = req.user.id;

    const analytics = await analyticsService.getAllQuizzesAnalytics(adminId);

    return res.status(200).json({
      success: true,
      count: analytics.length,
      analytics,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get student performance for a quiz
 */
export async function getStudentPerformance(req, res) {
  try {
    const { quizId } = req.params;

    const performance = await analyticsService.getStudentPerformance(quizId);

    return res.status(200).json({
      success: true,
      count: performance.length,
      performance,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(req, res) {
  try {
    const adminId = req.user.id;

    const stats = await analyticsService.getDashboardStats(adminId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get question statistics
 */
export async function getQuestionStatistics(req, res) {
  try {
    const { quizId } = req.params;

    const statistics = await analyticsService.getQuestionStatistics(quizId);

    return res.status(200).json({
      success: true,
      count: statistics.length,
      statistics,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
