import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzesForAdmin,
  getQuizById,
  addQuestion,      //new
  deleteQuestion,   //new
  getQuestions,     //new
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
//quiz routes
router.post("/quiz", authenticateToken, authorizeAdminRole, createQuiz);
router.put(
  "/quiz/:quizId",
  authenticateToken,
  authorizeAdminRole,
  updateQuiz,
);
router.delete(
  "/quiz/:quizId",
  authenticateToken,
  authorizeAdminRole,
  deleteQuiz,
);

//for pending results that has to be done by admin
//get the all pending quizzes
router.get(
  "/quizzes/pending",
  authenticateToken,
  authorizeAdminRole,
  getQuizzesWithPendingResults,
);
//get the docs for the pending-results.
router.get(
  "/quizzes/:quizId/pending-results",
  authenticateToken,
  authorizeAdminRole,
  getPendingResults,
);
// send the evaluated answers on this route
router.post(
  "/results/:resultId/evaluate",
  authenticateToken,
  authorizeAdminRole,
  evaluateResult,
);

//workflow for the publish and unpublish quiz.
//for frontend we fetch the quizzes.
router.get(
  "/quizzes/",
  authenticateToken,
  authorizeAdminRole,
  getAllQuizzesForAdmin,
);

router.get(
  "/quizzes/:quizId",
  authenticateToken,
  authorizeAdminRole,
  getQuizById,
);

//for publishing a quiz
router.post(
  "/quiz/:quizId/publish",
  authenticateToken,
  authorizeAdminRole,
  publishQuiz,
);

//for unpublishing a quiz.

router.post(
  "/quiz/:quizId/unpublish",
  authenticateToken,
  authorizeAdminRole,
  unpublishQuiz,
);

//workflow for the viewing all the result docs of students

//for fetching the all results for the particular quiz

router.get(
  "/quizzes/:quizId/results",
  authenticateToken,
  authorizeAdminRole,
  getAllResultsForQuiz,
);

// get the particular doc

router.get(
  "/quizzes/:quizId/results/:userId",
  authenticateToken,
  authorizeAdminRole,
  getResultForStudent,
);

// by ADP
router.post(
  "/quizzes/:quizId/questions",
  authenticateToken,
  authorizeAdminRole,
  addQuestion
);
// by ADP
router.delete(
  "/quizzes/:quizId/questions/:questionId",
  authenticateToken,
  authorizeAdminRole,
  deleteQuestion
);
// by ADP
router.get(
  "/quizzes/:quizId/questions",
  authenticateToken,
  authorizeAdminRole,
  getQuestions
);

export default router;
