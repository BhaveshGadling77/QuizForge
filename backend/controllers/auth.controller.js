import { serverTimestamp } from "firebase/firestore";
import { hashPassword } from "../services/encrytion.service.js";
import { AuthService } from "../services/auth.service.js";
import { generateAccessToken } from "../services/token.service.js";

const authService = new AuthService();

// REGISTER
// auth.controller.js - replace register function
export async function register(req, res) {
  try {
    let { email, name, password, role } = req.body;
    const createdAt = serverTimestamp();
    const updatedAt = serverTimestamp();
    password = await hashPassword(password);
    const userData = { email, name, password, role, createdAt, updatedAt };
    const docRef = await authService.registerUser(userData);

    const token = generateAccessToken({
      id: docRef.id,
      email,
      role,
    });

    return res.status(201).json({
      msg: "User registered successfully",
      token,
      user: { _id: docRef.id, name, email, role },
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

// LOGIN
// auth.controller.js - replace login function
export async function login(req, res) {
  try {
    const { token, user } = await authService.loginUser(req.body);

    res.cookie("quizforge_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      msg: "Login successful",
      token,
      user,
    });
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
}

// LOGOUT
export async function logout(req, res) {
  try {
    res.clearCookie("quizforge_token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(200).json({
      msg: "Logout successful",
    });
  } catch (e) {
    return res.status(500).json({
      error: "Logout failed",
    });
  }
}
