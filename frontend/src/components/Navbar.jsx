import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-forge-bg/80 backdrop-blur-md border-b border-forge-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to={user?.role === "admin" ? "/admin" : "/dashboard"}>
          <span className="font-display font-bold text-lg tracking-tight">
            Quiz<span className="text-forge-accent">Forge</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          {user?.role === "student" && (
            <>
              <Link
                to="/dashboard"
                className="text-forge-muted hover:text-forge-text text-sm transition-colors"
              >
                Quizzes
              </Link>
            </>
          )}
          {user?.role === "admin" && (
            <>
              <Link
                to="/admin"
                className="text-forge-muted hover:text-forge-text text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/create"
                className="text-forge-muted hover:text-forge-text text-sm transition-colors"
              >
                Create Quiz
              </Link>
            </>
          )}

          {/* User badge + logout */}
          {user && (
            <div className="flex items-center gap-3">
              <span className="badge bg-forge-border text-forge-muted font-mono capitalize">
                {user.role}
              </span>
              <span className="text-forge-text text-sm">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-forge-muted hover:text-forge-red text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}