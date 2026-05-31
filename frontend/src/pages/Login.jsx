import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { googleLogin, login as loginService } from "@/services/authService";
import { getGoogleAuthErrorMessage, signInWithGoogle } from "@/services/firebaseAuth";
import { useAuth } from "@/hooks/useAuth";

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.4 39.5 16.1 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.5-.4-3.5z" />
  </svg>
);

const EyeOpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17.94" y1="17.94" x2="22.99" y2="23" />
    <line x1="1" y1="1" x2="6" y2="6" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M6.53 6.53A10.24 10.24 0 0 0 1 12s4 8 11 8a10.44 10.44 0 0 0 5.47-1.53" />
    <line x1="1" y1="1" x2="22.99" y2="23" />
  </svg>
);

const Spinner = () => (
  <span style={{
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "qf-spin 0.7s linear infinite",
    verticalAlign: "middle",
    marginRight: 6,
  }} />
);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);
  const cardRef = useRef(null);

  const triggerShake = () => {
    setShaking(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShaking(true));
    });
    setTimeout(() => setShaking(false), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginService(form.email, form.password);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error ?? err.response?.data?.message ?? "Invalid credentials";
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const res = await googleLogin(idToken);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error ?? getGoogleAuthErrorMessage(err);
      setError(msg);
      triggerShake();
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forge-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-forge-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm z-10">
        {/* Logo */}
        <Link to="/">
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-4xl mb-2">
              Quiz<span className="text-forge-accent">Forge</span>
            </h1>
            <p className="text-forge-muted text-sm">Sign in to continue</p>
          </div>
        </Link>

        {/* Card */}
        <form
          ref={cardRef}
          onSubmit={handleSubmit}
          className={`card flex flex-col gap-5 ${shaking ? "qf-card-shake" : ""}`}
        >
          {/* Email */}
          <div>
            <label className="label">Email</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none", display: "flex" }}>
                <MailIcon />
              </div>
              <input
                className="input qf-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ paddingLeft: "2.75rem" }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none", display: "flex" }}>
                <LockIcon />
              </div>
              <input
                className="input qf-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="qf-eye-btn"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                }}
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0.6rem 0.75rem",
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.15)",
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#f87171",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <p className="text-forge-red text-xs font-mono">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary w-full mt-2 qf-btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s, transform 0.1s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Spinner />}
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <button
            type="button"
            disabled={loading || googleLoading}
            onClick={handleGoogleLogin}
            className="w-full"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: 44,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "#f3f4f6",
              fontWeight: 600,
              opacity: googleLoading ? 0.7 : 1,
              transition: "border-color 0.15s, background 0.15s, transform 0.1s",
            }}
          >
            {googleLoading ? <Spinner /> : <GoogleIcon />}
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>
        </form>

        <p className="text-center text-forge-muted text-sm mt-6">
          No account?{" "}
          <Link to="/register" className="text-forge-accent hover:underline font-medium transition-all">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
