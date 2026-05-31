import { findById, createUser } from "../utils/users.utils.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { generateAccessToken, decodeToken } from "./token.service.js";
import { db } from "../config/firebase.config.js";
import { adminAuth } from "../config/firebaseAdmin.config.js";
import { comparePassword } from "./encrytion.service.js";

const usersCollection = process.env.COLLECTION_USERS || "users";

async function findUserByEmail(email) {
  const q = query(collection(db, usersCollection), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const userDoc = snapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

function formatAuthUser(user) {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

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
      const user = await findUserByEmail(email);

      if (!user) throw new Error("User not found");
      if (!user.password) {
        throw new Error("Please continue with Google for this account");
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) throw new Error("Invalid password");

      const token = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: formatAuthUser(user),
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async googleLoginUser(data) {
    try {
      const { idToken, role: requestedRole } = data;
      if (!idToken) throw new Error("Google ID token missing");

      const decodedToken = await adminAuth.verifyIdToken(idToken);
      if (!decodedToken.email) throw new Error("Google account email missing");

      const existingUser = await findUserByEmail(decodedToken.email);
      let user = existingUser;

      if (!user) {
        if (!requestedRole) {
          throw new Error("No account found. Please register first.");
        }

        const now = new Date();
        const role = requestedRole === "admin" ? "admin" : "student";
        const docRef = await this.registerUser({
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email.split("@")[0],
          password: null,
          role,
          authProvider: "google",
          googleUid: decodedToken.uid,
          photoURL: decodedToken.picture || "",
          createdAt: now,
          updatedAt: now,
        });

        user = {
          id: docRef.id,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email.split("@")[0],
          role,
        };
      }

      const token = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: formatAuthUser(user),
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
