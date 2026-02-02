import jwt from "jsonwebtoken";
import { findById } from "../utils/users.utils.js";

export class AuthService {
  
  //verify 
  async verifyAccessToken(token) {
    if (!token) {
      throw new Error("Access token missing");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      throw new Error("Invalid or expired token");
    }

    const user = await findById(decoded.id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
