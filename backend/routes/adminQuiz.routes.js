import { createQuiz } from "../controllers/createquiz.js";
import { updateQuiz } from "../controllers/updatequiz.js";
import { deleteQuiz } from "../controllers/deletequiz.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authRole.middleware.js";
import express from "express";

const router = express.Router();

router.post("/quiz", authenticateToken, authorizeRoles, createQuiz);
router.put("/quiz/:quizId", authenticateToken, authorizeRoles, updateQuiz);
router.delete("/quiz/:quizId", authenticateToken, authorizeRoles, deleteQuiz);

export default router;
