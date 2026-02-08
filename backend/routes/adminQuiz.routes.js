import { db } from "../config/firebase.config.js";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesWithPendingResults,
  getPendingResults,
  getAllQuizzesForAdmin,
  unpublishQuiz,
  publishQuiz
} from "../controllers/quiz.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeAdminRole } from "../middlewares/authRole.middleware.js";
import { AdminService } from "../services/admin.service.js";
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
export default router;
