/**
 * User Service
 * Handles user profile management and updates
 */

import {
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { hashPassword, comparePassword } from "./encrytion.service.js";

export class UserService {
  constructor(db) {
    this.db = db;
    this.usersCollection = collection(db, "users");
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User's Firestore ID
   * @returns {Promise<Object>} User profile (without sensitive data)
   */
  async getUserProfile(userId) {
    try {
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      const user = userSnap.data();

      // Remove sensitive data
      delete user.password;
      delete user.accessToken;

      return {
        id: userSnap.id,
        ...user,
      };
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User's Firestore ID
   * @param {Object} updates - Fields to update (name, email, etc.)
   * @returns {Promise<Object>} Updated user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      // Don't allow direct password update through this method
      if (updates.password) {
        throw new Error("Use changePassword method to update password");
      }

      // Check if email is being updated and if it's already taken
      if (updates.email) {
        const q = query(
          this.usersCollection,
          where("email", "==", updates.email.toLowerCase()),
        );
        const snapshot = await getDocs(q);

        // Check if email exists and belongs to different user
        if (!snapshot.empty) {
          const existingUser = snapshot.docs[0];
          if (existingUser.id !== userId) {
            throw new Error("Email already in use");
          }
        }

        updates.email = updates.email.toLowerCase();
      }

      const userRef = doc(this.usersCollection, userId);
      updates.updatedAt = new Date();

      await updateDoc(userRef, updates);

      return await this.getUserProfile(userId);
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  /**
   * Change user password
   * @param {string} userId - User's Firestore ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean}>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      const user = userSnap.data();

      // Verify old password
      const isPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await updateDoc(userRef, {
        password: hashedPassword,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  /**
   * Get user statistics
   * @param {string} userId - User's Firestore ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(userId) {
    try {
      const resultsCollection = collection(
        this.db,
        process.env.COLLECTION_RESULTS,
      );
      const q = query(resultsCollection, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      const results = snapshot.docs.map((doc) => doc.data());

      const totalAttempts = results.length;
      const averageScore =
        results.length > 0
          ? (
              results.reduce((sum, r) => sum + (r.score || 0), 0) /
              results.length
            ).toFixed(2)
          : 0;

      const highestScore =
        results.length > 0 ? Math.max(...results.map((r) => r.score || 0)) : 0;

      return {
        totalAttempts,
        averageScore: parseFloat(averageScore),
        highestScore,
        lastAttemptDate:
          results.length > 0 ? results[results.length - 1].timestamp : null,
      };
    } catch (error) {
      throw new Error(`Failed to fetch user stats: ${error.message}`);
    }
  }

  /**
   * Get all users (admin only)
   * @returns {Promise<Array>} List of all users
   */
  async getAllUsers() {
    try {
      const snapshot = await getDocs(this.usersCollection);

      return snapshot.docs.map((doc) => {
        const user = doc.data();
        delete user.password; // Remove sensitive data
        return {
          id: doc.id,
          ...user,
        };
      });
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  /**
   * Get user statistics by role
   * @returns {Promise<Object>} Statistics by user role
   */
  async getUserStats() {
    try {
      const snapshot = await getDocs(this.usersCollection);

      let adminCount = 0;
      let studentCount = 0;

      snapshot.docs.forEach((doc) => {
        const user = doc.data();
        if (user.role === "admin") {
          adminCount++;
        } else if (user.role === "student") {
          studentCount++;
        }
      });

      return {
        totalUsers: snapshot.docs.length,
        admins: adminCount,
        students: studentCount,
      };
    } catch (error) {
      throw new Error(`Failed to fetch user statistics: ${error.message}`);
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User's Firestore ID
   * @returns {Promise<{success: boolean}>}
   */
  async deleteUserAccount(userId) {
    try {
      const userRef = doc(this.usersCollection, userId);

      // Check if user exists
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      // TODO: Delete all user data (results, drafts, etc.)
      // await deleteDoc(userRef);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete user account: ${error.message}`);
    }
  }
}
