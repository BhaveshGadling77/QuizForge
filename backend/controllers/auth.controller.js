import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

// REGISTER
export async function register(req, res) {
  try {
    const userId = await authService.registerUser(req.body);

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
    const { token } = await authService.loginUser(req.body);

    // Cookie (for browser usage)
    res.cookie("quizforge_token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      msg: "Login successful",
      token, // optional (useful for mobile apps)
    });
  } catch (e) {
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
