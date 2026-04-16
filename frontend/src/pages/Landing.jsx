import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Zap,
  BarChart3,
  Users,
  ShieldCheck,
  ArrowRight,
  Check,
  Sparkles,
  Clock,
  BookOpen,
  Trophy,
  ChevronRight,
  Star,
  Play,
  Lock,
  Globe,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant quizzes",
    desc: "Create and publish quizzes in seconds. No friction, no setup headaches.",
    accent: "#a78bfa",
    accentBg: "rgba(124,58,237,0.08)",
    accentBorder: "rgba(124,58,237,0.2)",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    desc: "Track scores, completion rates, and performance trends in real time.",
    accent: "#34d399",
    accentBg: "rgba(52,211,153,0.08)",
    accentBorder: "rgba(52,211,153,0.2)",
  },
  {
    icon: Users,
    title: "Multi-role support",
    desc: "Separate dashboards for admins and students, each built for their workflow.",
    accent: "#60a5fa",
    accentBg: "rgba(96,165,250,0.08)",
    accentBorder: "rgba(96,165,250,0.2)",
  },
  {
    icon: ShieldCheck,
    title: "Secure & reliable",
    desc: "JWT-based auth and role-based access keep your data safe at every layer.",
    accent: "#f472b6",
    accentBg: "rgba(244,114,182,0.08)",
    accentBorder: "rgba(244,114,182,0.2)",
  },
];

const steps = [
  {
    num: "01",
    icon: BookOpen,
    title: "Create an account",
    desc: "Sign up as a student or admin in under a minute.",
    color: "#a78bfa",
  },
  {
    num: "02",
    icon: Layers,
    title: "Build your quiz",
    desc: "Add questions, set time limits, and configure scoring.",
    color: "#60a5fa",
  },
  {
    num: "03",
    icon: Globe,
    title: "Share & track",
    desc: "Invite students and watch results roll in live.",
    color: "#34d399",
  },
];

const stats = [
  { num: "10k+", label: "Quizzes created", icon: Trophy },
  { num: "98%", label: "Uptime guaranteed", icon: ShieldCheck },
  { num: "2 roles", label: "Admin & student", icon: Users },
];

const testimonials = [
  {
    name: "Priya S.",
    role: "High School Teacher",
    text: "QuizForge saved me hours every week. My students actually enjoy the quizzes now.",
    stars: 5,
  },
  {
    name: "James K.",
    role: "Corporate Trainer",
    text: "The live analytics are a game-changer. I can see exactly where my team is struggling.",
    stars: 5,
  },
  {
    name: "Anika R.",
    role: "University Lecturer",
    text: "Setup took less than 5 minutes. I had my first quiz live before the class ended.",
    stars: 5,
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  // console.log("Auth loading:", loading, "User:", user); debug
  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";

  // useEffect(() => {
  //   if (!loading && user) {
  //     console.log("Redirecting to dashboard...");
  //   }
  // }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <span className="font-mono text-forge-muted text-sm animate-pulse">
          Checking session...
        </span>
      </div>
    );
  }

  return (
    <>
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>



        {/* ── Hero ── */}
        <section style={{ position: "relative", overflow: "hidden", padding: "6rem 2rem 5rem", textAlign: "center" }}>
          {/* Glow orbs */}
          <div className="qf-glow-orb" style={{ width: 500, height: 300, background: "rgba(124,58,237,0.12)", top: -60, left: "50%", transform: "translateX(-50%)" }} />
          <div className="qf-glow-orb" style={{ width: 200, height: 200, background: "rgba(96,165,250,0.06)", top: 100, left: "15%", animationDelay: "2s" }} />
          <div className="qf-glow-orb" style={{ width: 150, height: 150, background: "rgba(52,211,153,0.06)", top: 80, right: "15%", animationDelay: "3s" }} />

          {/* Grid overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          }} />

          <div className="qf-fade-up" style={{ maxWidth: 620, margin: "0 auto", position: "relative" }}>
            <div className="qf-badge" style={{ marginBottom: "1.75rem" }}>
              <Sparkles size={12} />
              Now in beta — free for everyone
            </div>

            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: "1.375rem",
              letterSpacing: "-0.02em",
            }}>
              Build quizzes that<br />
              <span className="qf-shimmer-text" style={{ fontStyle: "italic" }}>actually matter</span>
            </h1>

            <p className="qf-fade-up qf-d1" style={{ fontSize: "1.0625rem", color: "var(--muted-light)", lineHeight: 1.75, marginBottom: "2.25rem", maxWidth: 460, margin: "0 auto 2.25rem" }}>
              QuizForge lets educators and admins create, share, and analyze quizzes — and gives students a clean space to learn and improve.
            </p>

            <div className="qf-fade-up qf-d2" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: "2.5rem" }}>
              {user ? (
                <Link to={dashboardPath} className="qf-btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.5rem" }}>
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="qf-btn-primary" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.5rem" }}>
                    Create free account <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="qf-btn-ghost" style={{ fontSize: "0.9375rem", padding: "0.75rem 1.5rem" }}>
                    <Play size={14} style={{ fill: "currentColor" }} /> Watch demo
                  </Link>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="qf-fade-up qf-d3" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              {[
                { icon: Lock, text: "No credit card" },
                { icon: Users, text: "10k+ educators" },
                { icon: Star, text: "4.9 rating" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="qf-pill-icon">
                  <Icon size={11} style={{ color: "#a78bfa" }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Mock quiz card */}
          <div className="qf-fade-up qf-d4 qf-card-float" style={{ maxWidth: 460, margin: "4rem auto 0", position: "relative" }}>
            {/* Floating score badge */}
            <div style={{
              position: "absolute", top: -14, right: 20,
              background: "linear-gradient(135deg, #34d399, #059669)",
              borderRadius: 99, padding: "4px 12px",
              fontSize: "0.7rem", fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 16px rgba(52,211,153,0.35)",
              display: "flex", alignItems: "center", gap: 5,
              zIndex: 2,
            }}>
              <Trophy size={11} fill="#fff" /> +10 pts
            </div>

            <div className="qf-quiz-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.375rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 3 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: i <= 2 ? "#7c3aed" : "rgba(255,255,255,0.08)" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "monospace" }}>2 / 5</span>
                  </div>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>What does JSX stand for?</p>
                </div>
                <div style={{
                  background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                  borderRadius: 8, padding: "5px 10px",
                  fontSize: "0.75rem", color: "#a78bfa", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                }}>
                  <Clock size={12} /> 0:42
                </div>
              </div>

              {[
                { label: "A", text: "JavaScript XML", correct: true },
                { label: "B", text: "Java Syntax Extension", correct: false },
                { label: "C", text: "JSON XML", correct: false },
              ].map((opt) => (
                <div key={opt.label} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "0.65rem 0.875rem", borderRadius: 9, marginBottom: 8, cursor: "default",
                  border: opt.correct ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  background: opt.correct ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.02)",
                  transition: "all 0.15s",
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 700,
                    background: opt.correct ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.05)",
                    color: opt.correct ? "#34d399" : "var(--muted)",
                    border: opt.correct ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  }}>
                    {opt.correct ? <Check size={12} strokeWidth={2.5} /> : opt.label}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: opt.correct ? "var(--text)" : "var(--muted-light)", fontWeight: opt.correct ? 500 : 400 }}>
                    {opt.text}
                  </span>
                  {opt.correct && (
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "#34d399", fontWeight: 600 }}>
                      <Check size={11} strokeWidth={2.5} /> Correct
                    </div>
                  )}
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: "var(--muted)" }}>
                  <BarChart3 size={13} style={{ color: "#a78bfa" }} /> Score: <strong style={{ color: "#a78bfa" }}>80%</strong>
                </div>
                <button className="qf-btn-primary" style={{ padding: "0.4rem 0.875rem", fontSize: "0.78rem", cursor: "pointer" }}>
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <hr className="qf-divider" />
        <section style={{ padding: "2.5rem 2rem" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
            {stats.map(({ num, label, icon: Icon }, i) => (
              <div key={i} className="qf-stat-card" style={{ borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                  <Icon size={16} style={{ color: "#a78bfa" }} />
                  <p style={{ fontSize: "1.875rem", fontWeight: 800, color: "#a78bfa", letterSpacing: "-0.02em" }}>{num}</p>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </section>
        <hr className="qf-divider" />

        {/* ── Features ── */}
        <section id="features" style={{ padding: "5rem 2rem", maxWidth: 920, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>Features</p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(1.6rem, 3vw, 2.25rem)", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.25, marginBottom: 10 }}>
              Everything you need,<br /><em>nothing you don't</em>
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--muted-light)", maxWidth: 360, margin: "0 auto" }}>
              Purposefully designed so you spend less time configuring and more time teaching.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="qf-feature-card" style={{
                  animationDelay: `${i * 0.08}s`,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: f.accentBg,
                    border: `1px solid ${f.accentBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: f.accent, marginBottom: "1rem",
                    transition: "box-shadow 0.2s",
                  }}>
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 6, letterSpacing: "-0.005em" }}>{f.title}</p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: 1.65 }}>{f.desc}</p>

                  {/* Bottom accent line */}
                  <div style={{
                    position: "absolute", bottom: 0, left: "10%", right: "10%",
                    height: 1, background: `linear-gradient(90deg, transparent, ${f.accent}33, transparent)`,
                    opacity: 0, transition: "opacity 0.25s",
                  }} className="qf-feature-accent-line" />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" style={{ padding: "5rem 2rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>How it works</p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(1.6rem, 3vw, 2.25rem)", fontWeight: 400, letterSpacing: "-0.01em" }}>
                Up and running <em>in minutes</em>
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} style={{ display: "flex", gap: "1.5rem", paddingBottom: i < steps.length - 1 ? "2rem" : 0, position: "relative" }}>
                    {i < steps.length - 1 && (
                      <div style={{
                        position: "absolute", left: 20, top: 46, bottom: 0,
                        width: 1,
                        background: `linear-gradient(to bottom, ${s.color}40, transparent)`,
                      }} />
                    )}
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                      background: `rgba(${s.color === "#a78bfa" ? "167,139,250" : s.color === "#60a5fa" ? "96,165,250" : "52,211,153"},0.1)`,
                      border: `1px solid ${s.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: s.color,
                      boxShadow: `0 0 16px ${s.color}20`,
                    }}>
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: "0.65rem", fontFamily: "monospace", fontWeight: 700, color: s.color, letterSpacing: "0.06em" }}>{s.num}</span>
                        <p style={{ fontSize: "0.9375rem", fontWeight: 600, letterSpacing: "-0.005em" }}>{s.title}</p>
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: 1.65 }}>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" style={{ padding: "5rem 2rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>Reviews</p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(1.6rem, 3vw, 2.25rem)", fontWeight: 400, letterSpacing: "-0.01em" }}>
                Loved by <em>educators worldwide</em>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
              {testimonials.map((t, i) => (
                <div key={i} className="qf-testimonial">
                  <div style={{ display: "flex", gap: 2, marginBottom: "0.875rem" }}>
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted-light)", lineHeight: 1.7, marginBottom: "1rem", fontStyle: "italic" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 700, color: "#fff",
                    }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{t.name}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "5rem 2rem", textAlign: "center", borderTop: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div className="qf-glow-orb" style={{ width: 400, height: 200, background: "rgba(124,58,237,0.1)", bottom: 0, left: "50%", transform: "translateX(-50%)" }} />
          <div style={{
            maxWidth: 520, margin: "0 auto", position: "relative",
            background: "rgba(18,20,31,0.8)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: 20,
            padding: "3rem 2.5rem",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 0 1px rgba(124,58,237,0.08), 0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
            {/* Corner decoration */}
            <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: "radial-gradient(circle at top right, rgba(124,58,237,0.12), transparent 70%)", borderRadius: "0 20px 0 0", pointerEvents: "none" }} />

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
              }}>
                <Zap size={24} color="#fff" fill="#fff" />
              </div>
            </div>

            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.75rem", fontWeight: 400, marginBottom: "0.75rem", letterSpacing: "-0.01em" }}>
              Ready to forge your<br /><em>first quiz?</em>
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-light)", marginBottom: "2rem", lineHeight: 1.75 }}>
              Free to start. No credit card. Works for classrooms of 1 or 1,000.
            </p>
            <Link to="/register" className="qf-btn-primary" style={{ fontSize: "0.9375rem", padding: "0.8rem 2rem" }}>
              Create your account <ArrowRight size={16} />
            </Link>
            <p style={{ marginTop: "1.25rem", fontSize: "0.8rem", color: "#4b5563" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>Sign in →</Link>
            </p>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: "1.75rem" }}>
              {["Free forever", "No setup", "Instant quizzes"].map(text => (
                <div key={text} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  borderRadius: 99, padding: "3px 10px",
                  fontSize: "0.7rem", color: "#34d399", fontWeight: 500,
                }}>
                  <Check size={10} strokeWidth={2.5} /> {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        
      </div>
    </>
  );
}