import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginService(form.email, form.password);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forge-bg flex items-center justify-center px-4">
      {/* Glow backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-forge-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display font-bold text-3xl mb-1">
            Quiz<span className="text-forge-accent">Forge</span>
          </h1>
          <p className="text-forge-muted text-sm">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <p className="text-forge-red text-xs font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-1 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-forge-muted text-sm mt-4">
          No account?{" "}
          <Link to="/register" className="text-forge-accent hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}