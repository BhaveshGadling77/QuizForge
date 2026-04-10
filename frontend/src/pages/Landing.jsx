import { Link } from "react-router-dom";

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const features = [
  {
    icon: <ZapIcon />,
    title: "Instant quizzes",
    desc: "Create and publish quizzes in seconds. No friction, no setup headaches.",
  },
  {
    icon: <BarChartIcon />,
    title: "Live analytics",
    desc: "Track scores, completion rates, and performance trends in real time.",
  },
  {
    icon: <UsersIcon />,
    title: "Multi-role support",
    desc: "Separate dashboards for admins and students, each built for their workflow.",
  },
  {
    icon: <ShieldIcon />,
    title: "Secure & reliable",
    desc: "JWT-based auth and role-based access keep your data safe at every layer.",
  },
];

const steps = [
  { num: "01", title: "Create an account", desc: "Sign up as a student or admin in under a minute." },
  { num: "02", title: "Build your quiz", desc: "Add questions, set time limits, and configure scoring." },
  { num: "03", title: "Share & track", desc: "Invite students and watch results roll in live." },
];

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes qf-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .qf-fade-up { animation: qf-fade-up 0.5s ease both; }
        .qf-delay-1 { animation-delay: 0.1s; }
        .qf-delay-2 { animation-delay: 0.2s; }
        .qf-delay-3 { animation-delay: 0.3s; }
        .qf-feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 1.25rem;
          transition: border-color 0.2s, background 0.2s;
        }
        .qf-feature-card:hover {
          background: rgba(167,139,250,0.05);
          border-color: rgba(167,139,250,0.2);
        }
        .qf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #7c3aed;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.65rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
        }
        .qf-btn-primary:hover { background: #6d28d9; }
        .qf-btn-primary:active { transform: scale(0.97); }
        .qf-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #9ca3af;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.65rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .qf-btn-ghost:hover {
          border-color: rgba(167,139,250,0.3);
          color: #a78bfa;
          background: rgba(167,139,250,0.05);
        }
        .qf-stat {
          text-align: center;
          padding: 1rem;
        }
        .qf-nav-link {
          color: #6b7280;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.15s;
        }
        .qf-nav-link:hover { color: #a78bfa; }
        .qf-step-num {
          font-size: 0.75rem;
          font-weight: 700;
          color: #7c3aed;
          font-family: monospace;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
      `}</style>

      <div className="min-h-screen bg-forge-bg" style={{ color: "#f0f0f0", fontFamily: "system-ui, sans-serif" }}>

        {/* Nav */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.125rem 2rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
          background: "rgba(15,17,23,0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}>
          <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>
            Quiz<span style={{ color: "#a78bfa" }}>Forge</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <a href="#features" className="qf-nav-link">Features</a>
            <a href="#how-it-works" className="qf-nav-link">How it works</a>
            <Link to="/login" className="qf-btn-ghost" style={{ padding: "0.45rem 1rem", fontSize: "0.8125rem" }}>
              Sign in
            </Link>
            <Link to="/register" className="qf-btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.8125rem" }}>
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ position: "relative", overflow: "hidden", padding: "5rem 2rem 4rem", textAlign: "center" }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)",
          }} />

          <div className="qf-fade-up" style={{ maxWidth: 580, margin: "0 auto" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: 99,
              padding: "4px 12px",
              fontSize: "0.75rem",
              color: "#a78bfa",
              fontWeight: 500,
              marginBottom: "1.5rem",
              letterSpacing: "0.02em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
              Now in beta — free for everyone
            </div>

            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
              Build quizzes that<br />
              <span style={{ color: "#a78bfa" }}>actually matter</span>
            </h1>

            <p style={{ fontSize: "1rem", color: "#9ca3af", lineHeight: 1.7, marginBottom: "2rem", maxWidth: 440, margin: "0 auto 2rem" }}>
              QuizForge lets educators and admins create, share, and analyze quizzes — and gives students a clean space to learn and improve.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <Link to="/register" className="qf-btn-primary">
                Create free account <ArrowRightIcon />
              </Link>
              <Link to="/login" className="qf-btn-ghost">
                Sign in
              </Link>
            </div>
          </div>

          {/* Mock quiz card */}
          <div className="qf-fade-up qf-delay-2" style={{ maxWidth: 480, margin: "3.5rem auto 0", position: "relative" }}>
            <div style={{
              background: "#1a1d27",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "1.5rem",
              textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#6b7280", fontFamily: "monospace", marginBottom: 2 }}>QUESTION 2 OF 5</p>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#f0f0f0" }}>What does JSX stand for?</p>
                </div>
                <div style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem", color: "#a78bfa", fontWeight: 600, whiteSpace: "nowrap" }}>
                  0:42
                </div>
              </div>
              {[
                { label: "A", text: "JavaScript XML", correct: true },
                { label: "B", text: "Java Syntax Extension", correct: false },
                { label: "C", text: "JSON XML", correct: false },
              ].map((opt) => (
                <div key={opt.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0.6rem 0.875rem",
                  borderRadius: 8,
                  border: opt.correct ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  background: opt.correct ? "rgba(52,211,153,0.07)" : "rgba(255,255,255,0.02)",
                  marginBottom: 8,
                  cursor: "default",
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 700,
                    background: opt.correct ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)",
                    color: opt.correct ? "#34d399" : "#6b7280",
                    border: opt.correct ? "1px solid rgba(52,211,153,0.3)" : "1px solid transparent",
                  }}>
                    {opt.correct ? <CheckIcon /> : opt.label}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: opt.correct ? "#f0f0f0" : "#9ca3af" }}>{opt.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "2rem" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
            {[
              { num: "10k+", label: "Quizzes created" },
              { num: "98%", label: "Uptime guaranteed" },
              { num: "2 roles", label: "Admin & student" },
            ].map((s, i) => (
              <div key={i} className="qf-stat" style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#a78bfa", marginBottom: 4 }}>{s.num}</p>
                <p style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" style={{ padding: "4rem 2rem", maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: 8 }}>FEATURES</p>
            <h2 style={{ fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.01em" }}>Everything you need, nothing you don't</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="qf-feature-card">
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#a78bfa", marginBottom: "0.875rem",
                }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 6 }}>{f.title}</p>
                <p style={{ fontSize: "0.8125rem", color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ padding: "4rem 2rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: 8 }}>HOW IT WORKS</p>
              <h2 style={{ fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.01em" }}>Up and running in minutes</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "1.25rem", paddingBottom: i < steps.length - 1 ? "1.75rem" : 0, position: "relative" }}>
                  {i < steps.length - 1 && (
                    <div style={{
                      position: "absolute", left: 18, top: 40, bottom: 0,
                      width: 1, background: "rgba(124,58,237,0.15)",
                    }} />
                  )}
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 700, color: "#a78bfa", fontFamily: "monospace",
                  }}>
                    {s.num}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 4 }}>{s.title}</p>
                    <p style={{ fontSize: "0.8125rem", color: "#6b7280", lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "4rem 2rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            maxWidth: 500, margin: "0 auto",
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.18)",
            borderRadius: 16,
            padding: "2.5rem 2rem",
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "-0.01em" }}>
              Ready to forge your first quiz?
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "1.75rem", lineHeight: 1.7 }}>
              Free to start. No credit card. Works for classrooms of 1 or 1,000.
            </p>
            <Link to="/register" className="qf-btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.75rem" }}>
              Create your account <ArrowRightIcon />
            </Link>
            <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#4b5563" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#a78bfa", textDecoration: "none" }}>Sign in</Link>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "1.5rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            Quiz<span style={{ color: "#a78bfa" }}>Forge</span>
          </span>
          <p style={{ fontSize: "0.75rem", color: "#4b5563" }}>
            © {new Date().getFullYear()} QuizForge. Built with React.
          </p>
        </footer>
      </div>
    </>
  );
}