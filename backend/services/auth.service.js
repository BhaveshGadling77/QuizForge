import { findById, createUser, getUserList } from "../utils/users.utils.js";
import { collection, query, where, getDocs, connectFirestoreEmulator } from "firebase/firestore";
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
    // console.log(user)
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

  // auth.service.js - replace loginUser method
  async loginUser(data) {
    try {
      const { email, password } = data;
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) throw new Error("User not found");

      const userDoc = snapshot.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() };

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) throw new Error("Invalid password");

      const token = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }
}