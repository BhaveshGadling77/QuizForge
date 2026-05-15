import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "@/services/userService";
import toast from "react-hot-toast";
import { Eye, EyeOff, User, Mail, Lock, Save } from "lucide-react";

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({ name: "", email: "" });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      setProfile(res.data.profile);
      setEditData({
        name: res.data.profile.name,
        email: res.data.profile.email,
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editData.name.trim() || !editData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateUserProfile(editData);
      setProfile(res.data.profile);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      await changePassword(passwordData);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-forge-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-forge-text">
            My Profile
          </h1>
          <p className="text-forge-muted text-sm mt-2">
            Manage your account information and security settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-forge-surface rounded-2xl border border-forge-border p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-forge-accent to-forge-accent/60 rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-forge-bg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-forge-text">
                  {profile?.name}
                </h2>
                <p className="text-forge-muted text-sm">{profile?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-forge-accent text-forge-bg font-medium hover:bg-forge-accent/90 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-forge-border bg-forge-bg text-forge-text focus:outline-none focus:border-forge-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-forge-border bg-forge-bg text-forge-text focus:outline-none focus:border-forge-accent"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-forge-accent text-forge-bg font-medium hover:bg-forge-accent/90 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-forge-border text-forge-text hover:bg-forge-bg/50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-forge-surface rounded-2xl border border-forge-border p-6 mb-6">
          <h3 className="text-lg font-bold text-forge-text mb-4">
            Account Information
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-forge-border/30">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-forge-accent" />
                <div>
                  <p className="text-sm text-forge-muted">Email</p>
                  <p className="text-forge-text font-medium">
                    {profile?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-forge-border/30">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-forge-accent" />
                <div>
                  <p className="text-sm text-forge-muted">Role</p>
                  <p className="text-forge-text font-medium capitalize">
                    {profile?.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-forge-accent" />
                <div>
                  <p className="text-sm text-forge-muted">Member Since</p>
                  <p className="text-forge-text font-medium">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-forge-surface rounded-2xl border border-forge-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-forge-text">Security</h3>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-forge-accent hover:underline text-sm font-medium"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-forge-border bg-forge-bg text-forge-text focus:outline-none focus:border-forge-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-muted hover:text-forge-text"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-forge-border bg-forge-bg text-forge-text focus:outline-none focus:border-forge-accent"
                />
                <p className="text-xs text-forge-muted mt-1">
                  Must contain uppercase, lowercase, and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-forge-border bg-forge-bg text-forge-text focus:outline-none focus:border-forge-accent"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-forge-accent text-forge-bg font-medium hover:bg-forge-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-forge-border text-forge-text hover:bg-forge-bg/50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showPasswordForm && (
            <div className="text-sm text-forge-muted">
              Keep your account secure by using a strong password and changing
              it regularly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
