import { AuthenticationService } from "../services/authentication.service.js";

const authService = new AuthenticationService();

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    const user = await authService.verifyAccessToken(token);

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
}
