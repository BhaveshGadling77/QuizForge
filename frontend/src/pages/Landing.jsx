import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Footer from "../components/Footer.jsx";
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
  ArrowUpRight,
  Activity,
  Radio,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant quizzes",
    desc: "Create and publish quizzes in seconds. No friction, no setup headaches.",
    accent: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/20",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    desc: "Track scores, completion rates, and performance trends in real time.",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Users,
    title: "Multi-role support",
    desc: "Separate dashboards for admins and students, each built for their workflow.",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/20",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: ShieldCheck,
    title: "Secure & reliable",
    desc: "JWT-based auth and role-based access keep your data safe at every layer.",
    accent: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    glow: "shadow-pink-500/20",
    gradient: "from-pink-500 to-rose-600",
  },
];

const steps = [
  {
    num: "01",
    icon: BookOpen,
    title: "Create an account",
    desc: "Sign up as a student or admin in under a minute.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    line: "from-purple-500/40",
  },
  {
    num: "02",
    icon: Layers,
    title: "Build your quiz",
    desc: "Add questions, set time limits, and configure scoring.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    line: "from-blue-500/40",
  },
  {
    num: "03",
    icon: Globe,
    title: "Share & track",
    desc: "Invite students and watch results roll in live.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    line: "from-emerald-500/40",
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

function useScrollAnimation() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    const animated = el.querySelectorAll(".animate-on-scroll");
    animated.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";

  const heroRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const stepsRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "4s" }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      {/* ── Hero Section ── */}
      <section ref={heroRef} className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8 backdrop-blur-sm">
                <Sparkles size={14} className="text-purple-400" />
                Now in beta — free for everyone
              </div>

              <h1 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight mb-6">
                Build quizzes that{" "}
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 animate-shimmer bg-[length:200%_auto]">
                  actually matter
                </span>
              </h1>

              <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 text-lg text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
                QuizForge lets educators and admins create, share, and analyze quizzes — and gives students a clean space to learn and improve.
              </p>

              <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-300 flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                {user ? (
                  <Link 
                    to={dashboardPath} 
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
                  >
                    Go to dashboard
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
                    >
                      Create free account
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link 
                      to="/login" 
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 font-medium rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Play size={14} className="fill-current" /> Watch demo
                    </Link>
                  </>
                )}
              </div>

              <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-400 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {[
                  { icon: Lock, text: "No credit card" },
                  { icon: Users, text: "10k+ educators" },
                  { icon: Star, text: "4.9 rating" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm">
                    <Icon size={12} className="text-purple-400" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Interactive Quiz Card */}
            <div className="order-1 lg:order-2 relative">
              <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-500 relative max-w-md mx-auto">
                
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 z-20 animate-bounce" style={{ animationDuration: "3s" }}>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30">
                    <Trophy size={11} fill="currentColor" /> +10 pts
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 z-20">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-medium shadow-xl">
                    <Activity size={11} className="text-purple-400" /> Live
                  </div>
                </div>

                {/* Main Card */}
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex gap-1.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= 2 ? "w-6 bg-purple-500" : "w-6 bg-white/10"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-mono ml-auto">2 / 5</span>
                  </div>

                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h3 className="text-lg font-semibold text-slate-100 leading-snug">
                      What does JSX stand for?
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                      <Clock size={12} /> 0:42
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    {[
                      { label: "A", text: "JavaScript XML", correct: true },
                      { label: "B", text: "Java Syntax Extension", correct: false },
                      { label: "C", text: "JSON XML", correct: false },
                    ].map((opt) => (
                      <div 
                        key={opt.label} 
                        className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-default ${
                          opt.correct 
                            ? "bg-emerald-500/5 border-emerald-500/30" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                          opt.correct 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                            : "bg-white/5 text-slate-500 border border-white/10"
                        }`}>
                          {opt.correct ? <Check size={14} strokeWidth={2.5} /> : opt.label}
                        </span>
                        <span className={`text-sm ${opt.correct ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                          {opt.text}
                        </span>
                        {opt.correct && (
                          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <Check size={12} strokeWidth={2.5} /> Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <BarChart3 size={14} className="text-purple-400" />
                      Score: <span className="text-purple-400 font-bold">80%</span>
                    </div>
                    <button className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25">
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Decorative rings */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-3xl blur-2xl -z-10 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {stats.map(({ num, label, icon: Icon }, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-6 sm:py-0 group">
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={20} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-3xl font-bold text-purple-400 tracking-tight">{num}</span>
                </div>
                <span className="text-sm text-slate-500 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" ref={featuresRef} className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out text-xs font-bold text-purple-400 font-mono uppercase tracking-widest mb-4">
              Features
            </p>
            <h2 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Everything you need, <br />
              <span className="italic text-slate-400">nothing you don't</span>
            </h2>
            <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 text-slate-400">
              Purposefully designed so you spend less time configuring and more time teaching.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div 
                  key={i} 
                  className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1"
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center mb-5 group-hover:shadow-lg ${f.glow} transition-shadow duration-300`}>
                    <Icon size={22} strokeWidth={1.5} className={f.accent} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  
                  <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" ref={stepsRef} className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out text-xs font-bold text-purple-400 font-mono uppercase tracking-widest mb-4">
              How it works
            </p>
            <h2 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-4xl sm:text-5xl font-normal tracking-tight">
              Up and running <span className="italic text-slate-400">in minutes</span>
            </h2>
          </div>

          <div className="relative">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div 
                  key={i} 
                  className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out relative flex gap-6 pb-12 last:pb-0"
                  style={{ transitionDelay: `${(i + 1) * 150}ms` }}
                >
                  {i < steps.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                  
                  <div className={`relative shrink-0 w-10 h-10 rounded-full ${s.bg} ${s.border} border flex items-center justify-center z-10`}>
                    <Icon size={18} strokeWidth={1.5} className={s.color} />
                  </div>
                  
                  <div className="pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-mono font-bold ${s.color}`}>{s.num}</span>
                      <h3 className="text-lg font-semibold text-slate-100">{s.title}</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed max-w-md">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" ref={testimonialsRef} className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out text-xs font-bold text-purple-400 font-mono uppercase tracking-widest mb-4">
              Reviews
            </p>
            <h2 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-4xl sm:text-5xl font-normal tracking-tight">
              Loved by <span className="italic text-slate-400">educators worldwide</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                
                <p className="text-slate-300 leading-relaxed mb-6 text-[0.95rem] italic">
                  "{t.text}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaRef} className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out relative max-w-2xl mx-auto">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 shadow-2xl shadow-black/50 text-center overflow-hidden">
            
            {/* Corner glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 mb-6">
                <Zap size={28} className="text-white fill-white" />
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-4">
                Ready to forge your <br />
                <span className="italic text-purple-300">first quiz?</span>
              </h2>
              
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Free to start. No credit card. Works for classrooms of 1 or 1,000.
              </p>

              <Link 
                to="/register" 
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
              >
                Create your account
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <p className="mt-6 text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Sign in →
                </Link>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                {["Free forever", "No setup", "Instant quizzes"].map(text => (
                  <div key={text} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <Check size={10} strokeWidth={2.5} /> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}