import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export async function authenticateToken(req, res, next) {
  try {
    //if cookie exist in the user's browser
    let token = req.cookies?.quizforge_token;
    // const authHeader = req.headers["authorization"];

    // if (!authHeader) {
    //   return res.status(401).json({
    //     error: "Authorization header missing",
    //   });
    // }

    // const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "Token missing",
      });
    }

    const user = await authService.verifyAccessToken(token);
    console.log(user)
    req.user = user;
    next();

  } catch (e) {
    console.log(e.message)
    return res.status(401).json({ error: e.message });
  }
}
