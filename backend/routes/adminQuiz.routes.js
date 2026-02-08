import { db } from "../config/firebase.config.js";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesWithPendingResults,
  getPendingResults,
} from "../controllers/quiz.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeAdminRole } from "../middlewares/authRole.middleware.js";
import { AdminService } from "../services/admin.service.js";
import express from "express";

const router = express.Router();
const adminService = AdminService(db);
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

router.post(
  "/admin/results/:resultId/evaluate",
  authenticateToken,
  authorizeAdminRole,
  adminService.evaluateResult
);


export default router;
