import { db } from "../config/firebase.config.js";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesWithPendingResults,
  getPendingResults,
  getAllQuizzesForAdmin,
  unpublishQuiz,
  publishQuiz,
  getResultForStudent,
  getAllResultsForQuiz
} from "../controllers/quiz.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeAdminRole } from "../middlewares/authRole.middleware.js";
import express from "express";

const router = express.Router();
//quiz routes
router.post("/admin/quiz", authenticateToken, authorizeAdminRole, createQuiz);
router.put(
  "/admin/quiz/:quizId",
  authenticateToken,
  authorizeAdminRole,
  updateQuiz,
);
router.delete(
  "/admin/quiz/:quizId",
  authenticateToken,
  authorizeAdminRole,
  deleteQuiz,
);

//for pending results that has to be done by admin
//get the all pending quizzes
router.get(
  "/admin/quizzes/pending",
  authenticateToken,
  authorizeAdminRole,
  getQuizzesWithPendingResults,
);
//get the docs for the pending-results.
router.get(
  "/admin/quizzes/:quizId/pending-results",
  authenticateToken,
  authorizeAdminRole,
  getPendingResults,
);
// send the evaluated answers on this route
router.post(
  "/admin/results/:resultId/evaluate",
  authenticateToken,
  authorizeAdminRole,
  evaluateResult,
);

//workflow for the publish and unpublish quiz.
//for frontend we fetch the quizzes.
router.get(
  "/admin/quizzes/",
  authenticateToken,
  authorizeAdminRole,
  getAllQuizzesForAdmin
);
//for publishing a quiz
router.post(
  "/admin/quiz/:quizId/publish",
  authenticateToken,
  authorizeAdminRole,
  publishQuiz
)

//for unpublishing a quiz.

router.post(
  "/admin/quiz/:quizId/unpublish",
  authenticateToken, 
  authorizeAdminRole,
  unpublishQuiz
)

//workflow for the viewing all the result docs of students

//for fetching the all results for the particular quiz

router.get(
  "/admin/quizzes/:quizId/results",
  authenticateToken,
  authorizeAdminRole,
  getAllResultsForQuiz
);

// get the particular doc

router.get(
  "/admin/quizzes/:quizId/results/:userId",
  authenticateToken,
  authorizeAdminRole,
  getResultForStudent
)

export default router;
