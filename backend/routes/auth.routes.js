import express from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import {
  validateRegistration,
  validateLogin,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.post("/logout", logout);

export default router;
