import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, (req, res) => {
  res.json({ msg: "User authenticated successfully.", user: req.user });
});



export default router;
