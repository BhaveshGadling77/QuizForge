import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wraps routes that require authentication (and optionally a specific role).
 *
 * Usage:
 *   <Route element={<ProtectedRoute role="admin" />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <span className="font-mono text-forge-muted text-sm animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
}