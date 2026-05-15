/**
 * User Controller
 * Handles user profile and settings management
 */

import { db } from "../config/firebase.config.js";
import { UserService } from "../services/user.service.js";
import {
  validatePassword,
  validateName,
  validateEmail,
} from "../middlewares/validation.middleware.js";

const userService = new UserService(db);

/**
 * Get current user profile
 */
export async function getUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const profile = await userService.getUserProfile(userId);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Validate inputs
    const updates = {};

    if (name) {
      updates.name = validateName(name);
    }

    if (email) {
      updates.email = validateEmail(email);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const updatedProfile = await userService.updateUserProfile(userId, updates);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Change password
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    validatePassword(newPassword);

    const result = await userService.changePassword(
      userId,
      oldPassword,
      newPassword,
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(req, res) {
  try {
    const userId = req.user.id;
    const stats = await userService.getUserStats(userId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get user statistics (Admin only)
 */
export async function getAdminStats(req, res) {
  try {
    const stats = await userService.getUserStats();

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(req, res) {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    // Verify password before deletion
    const userService_instance = new UserService(db);
    const user = await userService_instance.getUserProfile(userId);

    const result = await userService_instance.deleteUserAccount(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
