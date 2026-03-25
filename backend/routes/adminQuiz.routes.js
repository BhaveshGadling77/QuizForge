import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzesForAdmin,
  getQuizById,
  addQuestion,
  deleteQuestion,
  getQuestions,
} from "../controllers/quiz.controller.js";

import {
  getQuizzesWithPendingResults,
  getPendingResults,
  evaluateResult,
  unpublishQuiz,
  publishQuiz,
  getAllResultsForQuiz,
  getResultForStudent,
} from "../controllers/admin.controller.js";

import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeAdminRole } from "../middlewares/authRole.middleware.js";
import express from "express";

const router = express.Router();

/* QUIZ CRUD  */

// quiz create
router.post(
  "/quizzes",
  authenticateToken,
  authorizeAdminRole,
  createQuiz
);

// update a quiz 
router.put(
  "/quizzes/:quizId",
  authenticateToken,
  authorizeAdminRole,
  updateQuiz
);

// delete a quiz
router.delete(
  "/quizzes/:quizId",
  authenticateToken,
  authorizeAdminRole,
  deleteQuiz
);

// get all quizzes
router.get(
  "/quizzes",
  authenticateToken,
  authorizeAdminRole,
  getAllQuizzesForAdmin
);

// get single quiz
router.get(
  "/quizzes/:quizId",
  authenticateToken,
  authorizeAdminRole,
  getQuizById
);

/*  QUESTIONS  */

// ✅ Add question
router.post(
  "/quizzes/:quizId/questions",
  authenticateToken,
  authorizeAdminRole,
  addQuestion
);

// delete question
router.delete(
  "/quizzes/:quizId/questions/:questionId",
  authenticateToken,
  authorizeAdminRole,
  deleteQuestion
);

// get questions
router.get(
  "/quizzes/:quizId/questions",
  authenticateToken,
  authorizeAdminRole,
  getQuestions
);

/* PUBLISH  */

// Publish
router.post(
  "/quizzes/:quizId/publish",
  authenticateToken,
  authorizeAdminRole,
  publishQuiz
);

// Unpublish
router.post(
  "/quizzes/:quizId/unpublish",
  authenticateToken,
  authorizeAdminRole,
  unpublishQuiz
);

/* RESUTLS */

// pehding results
router.get(
  "/quizzes/pending",
  authenticateToken,
  authorizeAdminRole,
  getQuizzesWithPendingResults
);

// pending results
router.get(
  "/quizzes/:quizId/pending-results",
  authenticateToken,
  authorizeAdminRole,
  getPendingResults
);

// Evaluate result
router.post(
  "/results/:resultId/evaluate",
  authenticateToken,
  authorizeAdminRole,
  evaluateResult
);

// all results for quiz
router.get(
  "/quizzes/:quizId/results",
  authenticateToken,
  authorizeAdminRole,
  getAllResultsForQuiz
);

// Single student result
router.get(
  "/quizzes/:quizId/results/:userId",
  authenticateToken,
  authorizeAdminRole,
  getResultForStudent
);

export default router;