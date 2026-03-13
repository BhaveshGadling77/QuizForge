import { findById, createUser, getUserList } from "../utils/users.utils.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { generateAccessToken, decodeToken } from "./token.service.js";
import { db } from "../config/firebase.config.js";
import { comparePassword } from "./encrytion.service.js";
export class AuthService {
  //verify
  async verifyAccessToken(token) {
    if (!token) {
      throw new Error("Access token missing");
    }

    let decoded;
    try {
      decoded = decodeToken(token)
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
      const { email, password } = data
      const q = query(collection(db, "users"), where("email", "==", email));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("User not found");
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data();
      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        throw new Error("Invalid password");
      }
      return generateAccessToken(data);
    } catch (e) {
      console.log(e.message)
      throw new Error(e.message);
    }
  }
}
