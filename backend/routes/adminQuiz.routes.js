import { createQuiz } from "../controllers/createquiz.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authRole.middleware.js";
import express from 'express'

const router = express.Router();

router.post("/quiz", authenticateToken, authorizeRoles, createQuiz);

export default router
