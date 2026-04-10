import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/utils/constants";

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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

const PasswordStrength = ({ password }) => {
  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  if (!password) return null;

  const labels = ["", "Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#f87171", "#f87171", "#fbbf24", "#60a5fa", "#34d399"];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: i <= strength ? colors[strength] : "rgba(255,255,255,0.08)",
              transition: "background 0.3s ease-in-out",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 12, color: colors[strength], fontFamily: "monospace", textAlign: "right", margin: 0 }}>
        {labels[strength]}
      </p>
    </div>
  );
};

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: ROLES.STUDENT });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);

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
      const res = await register(form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Registration failed";
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forge-bg flex items-center justify-center px-4 relative overflow-hidden py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-forge-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm z-10">
        <Link to='/'>
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-4xl mb-2">
              Quiz<span className="text-forge-accent">Forge</span>
            </h1>
            <p className="text-forge-muted text-sm">Create your account</p>
          </div>
        </Link>

        <form
          onSubmit={handleSubmit}
          className={`card flex flex-col gap-5 ${shaking ? "qf-card-shake" : ""}`}
        >
          {/* Name */}
          <div>
            <label className="label">Name</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none", display: "flex" }}>
                <UserIcon />
              </div>
              <input
                className="input qf-input"
                type="text"
                placeholder="Akshay Kumar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ paddingLeft: "2.75rem" }}
                required
              />
            </div>
          </div>

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
                placeholder="Min. 6 characters"
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
            <PasswordStrength password={form.password} />
          </div>

          {/* Role toggle */}
          <div>
            <label className="label">Role</label>
            <div style={{
              display: "flex",
              gap: 6,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 4,
            }}>
              {[ROLES.STUDENT, ROLES.ADMIN].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`qf-role-btn ${form.role === role ? "active" : ""}`}
                  style={{ flex: 1, padding: "8px 0" }}
                  onClick={() => setForm({ ...form, role })}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0.6rem 0.75rem",
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.15)",
              borderRadius: 8,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#f87171",
                flexShrink: 0,
                display: "inline-block",
              }} />
              <p className="text-forge-red text-xs font-mono">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
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
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="text-center text-forge-muted text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-forge-accent hover:underline font-medium transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}