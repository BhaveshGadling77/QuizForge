import { serverTimestamp } from "firebase/firestore";
import { hashPassword } from "../services/encrytion.service.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

// REGISTER
export async function register(req, res) {
  try {
    let { email, name, password, role } = req.body
    const createdAt = serverTimestamp()
    const updatedAt = serverTimestamp()
    password = await hashPassword(password)
    const user = {email, name, password, role, createdAt, updatedAt}
  
    const userId = await authService.registerUser(user);
    return res.status(201).json({
      msg: "User registered successfully",
      userId,
    });
  } catch (e) {
    return res.status(400).json({
      error: e.message,
    });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    console.log(req.body)
    const token  = await authService.loginUser(req.body);
    console.log("access Token for the user: ", token)
    // Cookie (for browser usage)
    res.cookie("quizforge_token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      msg: "Login successful",
      token,
    });
  } catch (e) {
    console.log(e.message)
    return res.status(401).json({
      error: e.message,
    });
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
