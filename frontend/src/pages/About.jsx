import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";
import {
  Shield,
  Clock,
  FileText,
  BarChart3,
  Users,
  Lock,
  Zap,
  Globe,
  KeyRound,
  Timer,
  CheckCircle2,
  HelpCircle,
  Award,
  History,
  Server,
  Cookie,
  Fingerprint,
  Eye,
  Code2,
  Database,
  Flame,
  ArrowRight,
  Layers,
  BookOpen,
  ChevronRight,
  Radio,
} from "lucide-react";

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
    el.querySelectorAll(".animate-on-scroll").forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function AboutPage() {
  const { user } = useAuth();
  const heroRef = useScrollAnimation();
  const purposeRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const studentRef = useScrollAnimation();
  const adminRef = useScrollAnimation();
  const securityRef = useScrollAnimation();
  const techRef = useScrollAnimation();
  const closingRef = useScrollAnimation();

  const features = [
    { icon: Users, title: "Role-based access", desc: "Separate dashboards and permissions for students and admins." },
    { icon: Fingerprint, title: "Secure auth", desc: "Email/password login plus Google OAuth with bcrypt hashing." },
    { icon: Cookie, title: "HTTP-only JWT", desc: "Session tokens stored in secure cookies, not localStorage." },
    { icon: Globe, title: "Public & private quizzes", desc: "Publish openly or restrict with encrypted access tokens." },
    { icon: KeyRound, title: "Encrypted tokens", desc: "Private quiz access keys are encrypted before storage." },
    { icon: Timer, title: "Timed attempts", desc: "Backend-validated countdown timers to prevent manipulation." },
    { icon: HelpCircle, title: "Multiple question types", desc: "MCQ, true/false, short integer, and short subjective." },
    { icon: CheckCircle2, title: "Auto grading", desc: "Objective questions are scored instantly on submission." },
    { icon: Eye, title: "Manual evaluation", desc: "Admins review and score subjective answers individually." },
    { icon: FileText, title: "Result breakdowns", desc: "Markdown-rendered questions with per-question score cards." },
    { icon: History, title: "Student history", desc: "Complete attempt history with scores and timestamps." },
    { icon: Award, title: "Leaderboards", desc: "Ranked performance views across quizzes and time periods." },
  ];

  const techStack = [
    {
      label: "Frontend",
      items: ["React", "Vite", "Tailwind CSS", "React Query", "Axios"],
      icon: Code2,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Backend",
      items: ["Node.js", "Express", "Firebase Firestore", "Firebase Admin SDK"],
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Authentication",
      items: ["JWT cookies", "Google OAuth", "bcrypt hashing"],
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "4s" }} />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      <div className="relative z-10">
        
        {/* ── 1. Hero ── */}
        <section ref={heroRef} className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8 backdrop-blur-sm">
              <Radio size={14} className="text-purple-400" />
              Project overview
            </div>

            <h1 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight mb-6">
              About <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">QuizForge</span>
            </h1>

            <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
              A full-stack quiz and assessment platform built for creating, attempting, evaluating, and tracking quizzes.
            </p>

            <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-300 text-slate-500 leading-relaxed max-w-2xl mx-auto">
              QuizForge supports complete admin quiz management, student quiz attempts with automatic grading, manual evaluation for subjective answers, detailed result history, and leaderboards — all within a secure, role-based environment.
            </p>
          </div>
        </section>

        {/* ── 2. What QuizForge Does ── */}
        <section ref={purposeRef} className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <p className="text-xs font-bold text-purple-400 font-mono uppercase tracking-widest mb-4">What it does</p>
                <h2 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-6">
                  Built for serious <br />
                  <span className="italic text-slate-400">assessment workflows</span>
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  QuizForge bridges the gap between quiz creation and meaningful evaluation. Admins build structured assessments with multiple question types, control visibility with public or private settings, and review every submission in detail.
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Students get a focused interface to attempt timed quizzes, receive instant feedback on objective answers, and track their progress over time through history and leaderboards.
                </p>
              </div>

              <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 space-y-4">
                {[
                  { icon: Layers, text: "Admins create and manage quizzes with full CRUD control" },
                  { icon: BookOpen, text: "Students attempt public or private quizzes with timed sessions" },
                  { icon: CheckCircle2, text: "Objective questions are graded automatically on submission" },
                  { icon: Eye, text: "Subjective answers are reviewed and scored manually by admins" },
                  { icon: BarChart3, text: "Results are saved for score breakdowns, history, and leaderboards" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-purple-400" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed pt-2">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Core Features ── */}
        <section id="features" ref={featuresRef} className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out text-xs font-bold text-purple-400 font-mono uppercase tracking-widest mb-4">
                Core Features
              </p>
              <h2 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-4">
                Everything under <span className="italic text-slate-400">the hood</span>
              </h2>
              <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 text-slate-500">
                A complete feature set designed for real-world assessment scenarios.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1"
                    style={{ transitionDelay: `${(i % 3) * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-shadow duration-300">
                      <Icon size={18} className="text-purple-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4. Student Workflow ── */}
        <section ref={studentRef} className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out text-xs font-bold text-blue-400 font-mono uppercase tracking-widest mb-4">
                Student Workflow
              </p>
              <h2 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-4xl sm:text-5xl font-normal tracking-tight">
                From login to <span className="italic text-slate-400">leaderboard</span>
              </h2>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 relative">
              {[
                { step: "01", text: "Student logs in via email/password or Google OAuth" },
                { step: "02", text: "Opens the dashboard and browses available quizzes" },
                { step: "03", text: "Selects a quiz and enters access token if private" },
                { step: "04", text: "Attempts the timed quiz with multiple question types" },
                { step: "05", text: "Submits answers and views instant objective results" },
                { step: "06", text: "Checks leaderboard and personal history for progress" },
              ].map((item, i, arr) => (
                <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
                  {i < arr.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-blue-500/40 to-transparent" />
                  )}
                  <div className="relative shrink-0 w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-mono font-bold z-10">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <p className="text-slate-300 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Admin Workflow ── */}
        <section ref={adminRef} className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out text-xs font-bold text-purple-400 font-mono uppercase tracking-widest mb-4">
                Admin Workflow
              </p>
              <h2 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-4xl sm:text-5xl font-normal tracking-tight">
                From creation to <span className="italic text-slate-400">evaluation</span>
              </h2>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 relative">
              {[
                { step: "01", text: "Admin logs in and accesses the admin dashboard" },
                { step: "02", text: "Creates a new quiz with metadata, timer, and access settings" },
                { step: "03", text: "Adds questions: MCQ, true/false, integer, or subjective" },
                { step: "04", text: "Publishes the quiz as public or generates a private token" },
                { step: "05", text: "Reviews student submissions and evaluates subjective answers" },
                { step: "06", text: "Views final results, score distributions, and performance stats" },
              ].map((item, i, arr) => (
                <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
                  {i < arr.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-purple-500/40 to-transparent" />
                  )}
                  <div className="relative shrink-0 w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-mono font-bold z-10">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <p className="text-slate-300 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Backend & Security ── */}
        <section ref={securityRef} className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out text-xs font-bold text-emerald-400 font-mono uppercase tracking-widest mb-4">
                Backend & Security
              </p>
              <h2 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-4">
                Built with <span className="italic text-slate-400">security first</span>
              </h2>
              <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 text-slate-500">
                Every layer is designed to protect data and prevent manipulation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Authenticated routes", desc: "Express backend protects all API routes with JWT verification middleware. No token, no access." },
                { icon: Cookie, title: "HTTP-only cookies", desc: "JWT is stored in a cookie named quizforge_token. Not accessible to JavaScript, resistant to XSS." },
                { icon: Fingerprint, title: "Session restoration", desc: "Frontend restores sessions by calling a protected backend endpoint on app load." },
                { icon: Lock, title: "Role authorization", desc: "Admin APIs explicitly check the role field. Students cannot access admin endpoints." },
                { icon: KeyRound, title: "Encrypted tokens", desc: "Private quiz access tokens are encrypted with AES before storage in the database." },
                { icon: Timer, title: "Backend timer validation", desc: "Quiz timers are validated server-side. Manipulating the client clock does not extend time." },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
                    style={{ transitionDelay: `${(i % 2) * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 7. Tech Stack ── */}
        <section ref={techRef} className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out text-xs font-bold text-purple-400 font-mono uppercase tracking-widest mb-4">
                Tech Stack
              </p>
              <h2 className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 font-serif text-4xl sm:text-5xl font-normal tracking-tight">
                The tools that <span className="italic text-slate-400">power it</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {techStack.map((stack, i) => {
                const Icon = stack.icon;
                return (
                  <div
                    key={i}
                    className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl ${stack.bg} ${stack.border} border flex items-center justify-center mb-5`}>
                      <Icon size={22} className={stack.color} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">{stack.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {stack.items.map((item) => (
                        <span
                          key={item}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${stack.bg} ${stack.border} border ${stack.color}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 8. Project Purpose + CTA ── */}
        <section ref={closingRef} className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out relative max-w-3xl mx-auto text-center">
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 shadow-2xl shadow-black/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-full pointer-events-none" />

              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 mb-6">
                <Flame size={28} className="text-white fill-white" />
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-6">
                Built to demonstrate <br />
                <span className="italic text-purple-300">complete assessment workflows</span>
              </h2>

              <p className="text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto">
                From authentication and quiz creation to timed attempts, automatic scoring, manual evaluation, and result analytics — QuizForge covers the full lifecycle of an online assessment platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {user ? "Explore Quizzes" : "Get Started"}
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>

                {user?.role === "admin" && (
                  <Link
                    to="/admin/create"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 font-medium rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Zap size={16} className="text-purple-400" />
                    Create Quiz
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}