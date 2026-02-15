import jwt from "jsonwebtoken";
import { findById, createUser, getUserList } from "../utils/users.utils.js";
import { generateAccessToken } from "./token.service.js";
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
  //register user.

  async registerUser(data) {
    try {
      return await createUser(data);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async loginUser(data) {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("User not found");
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data();

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error("Invalid password");
      }
      return generateAccessToken(data);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
