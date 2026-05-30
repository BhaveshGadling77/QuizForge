import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { getAttemptHistory, getStudentStatistics } from "@/services/quizService";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return "—";
  // Firestore SDK Timestamp instance
  if (typeof val?.toDate === "function") return fmt(val.toDate());
  // Serialized Firestore Timestamp { _seconds, _nanoseconds }
  if (val?._seconds !== undefined) return fmt(new Date(val._seconds * 1000));
  if (val?.seconds !== undefined)  return fmt(new Date(val.seconds  * 1000));
  // ISO string / number
  const d = new Date(val);
  return isNaN(d) ? "—" : fmt(d);
}
function fmt(d) {
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s < 10 ? "0" + s : s}s`;
}

function scoreColor(pct) {
  if (pct >= 80) return "#00d68f";
  if (pct >= 55) return "#ffd166";
  return "#ff4d6d";
}

function scoreBg(pct) {
  if (pct >= 80) return "rgba(0,214,143,0.10)";
  if (pct >= 55) return "rgba(255,209,102,0.10)";
  return "rgba(255,77,109,0.10)";
}

function scoreLabel(pct) {
  if (pct >= 80) return "Excellent";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Average";
  return "Needs Work";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = "#6c63ff", delay = 0 }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-forge-border bg-forge-surface p-5 flex flex-col gap-3 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, borderColor: `${accent}22` }}
    >
      {/* glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-forge-muted uppercase tracking-widest">{label}</p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-forge-text leading-none">{value}</p>
        {sub && <p className="text-xs text-forge-muted mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ pct = 0, size = 52 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(pct, 100) / 100) * circ;
  const color = scoreColor(pct);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <div className="h-8 w-48 rounded-lg bg-forge-surface animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-forge-surface animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-forge-surface animate-pulse" />
        <div className="h-96 rounded-2xl bg-forge-surface animate-pulse" />
      </main>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentHistory() {
  const { data: statsRes, isLoading: statsLoading } = useQuery(
    "studentStats",
    getStudentStatistics,
    { refetchOnWindowFocus: false }
  );

  const { data: historyRes, isLoading: historyLoading } = useQuery(
    "attemptHistory",
    getAttemptHistory,
    { refetchOnWindowFocus: false }
  );

  if (statsLoading || historyLoading) return <Skeleton />;

  const s = statsRes?.data?.data ?? {};
  const attempts = Array.isArray(historyRes?.data?.data) ? historyRes.data.data : [];

  const avgPct = Math.round(s.averagePercentage ?? 0);
  const highPct = Math.round(s.highestPercentage ?? 0);
  const accuracy =
    s.totalQuestions > 0
      ? Math.round((s.totalCorrect / s.totalQuestions) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-forge-muted hover:text-forge-accent transition-colors mb-5 group"
          >
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Quizzes
          </Link>
          <h1 className="text-3xl font-bold text-forge-text tracking-tight">Quiz History</h1>
          <p className="text-forge-muted text-sm mt-1">
            Your personal performance dashboard — {s.totalAttempts ?? 0} attempt{s.totalAttempts !== 1 ? "s" : ""} across {s.totalQuizzesAttempted ?? 0} quiz{s.totalQuizzesAttempted !== 1 ? "zes" : ""}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="⚡"
            label="Total Attempts"
            value={s.totalAttempts ?? 0}
            sub={`${s.totalQuizzesAttempted ?? 0} unique quizzes`}
            accent="#6c63ff"
            delay={0}
          />
          <StatCard
            icon="🏆"
            label="Highest Score"
            value={`${highPct}%`}
            sub={`${s.highestScore ?? 0} pts best`}
            accent="#ffd166"
            delay={60}
          />
          <StatCard
            icon="📈"
            label="Avg Score"
            value={`${avgPct}%`}
            sub={`${Math.round(s.averageScore ?? 0)} pts avg`}
            accent="#00d68f"
            delay={120}
          />
          <StatCard
            icon="🎯"
            label="Accuracy"
            value={`${accuracy}%`}
            sub={`${s.totalCorrect ?? 0} / ${s.totalQuestions ?? 0} correct`}
            accent="#ff7eb3"
            delay={180}
          />
        </div>

        {/* Best Quiz + Overall Progress row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          {/* Best Quiz Card */}
          {s.bestQuiz ? (
            <div className="rounded-2xl border border-forge-border bg-forge-surface p-5 animate-fade-up" style={{ animationDelay: "240ms" }}>
              <p className="text-xs font-medium text-forge-muted uppercase tracking-widest mb-4">🌟 Best Performance</p>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <ScoreRing pct={Math.round(s.bestQuiz.percentage)} size={64} />
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                    style={{ color: scoreColor(s.bestQuiz.percentage) }}
                  >
                    {Math.round(s.bestQuiz.percentage)}%
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-forge-text text-sm truncate">{s.bestQuiz.title}</p>
                  <p className="text-xs text-forge-muted mt-1">
                    {s.bestQuiz.score} / {s.bestQuiz.totalPoints} points
                  </p>
                  <Link
                    to={`/result/${s.bestQuiz.quizId}`}
                    className="text-xs text-forge-accent hover:underline mt-2 inline-block"
                  >
                    View result →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-forge-border bg-forge-surface p-5 flex items-center justify-center animate-fade-up" style={{ animationDelay: "240ms" }}>
              <p className="text-forge-muted text-sm">No attempts yet</p>
            </div>
          )}

          {/* Overview bars */}
          <div className="rounded-2xl border border-forge-border bg-forge-surface p-5 animate-fade-up" style={{ animationDelay: "300ms" }}>
            <p className="text-xs font-medium text-forge-muted uppercase tracking-widest mb-4">📊 Overview</p>
            <div className="space-y-3.5">
              {[
                { label: "Average Score", pct: avgPct, color: scoreColor(avgPct) },
                { label: "Best Score", pct: highPct, color: scoreColor(highPct) },
                { label: "Accuracy", pct: accuracy, color: "#6c63ff" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-forge-muted">{label}</span>
                    <span className="font-semibold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-forge-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-forge-border flex items-center justify-between text-xs text-forge-muted">
              <span>Avg time per quiz</span>
              <span className="font-mono text-forge-text font-semibold">
                {formatDuration(Math.round(s.averageTimeSeconds ?? 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Attempt History Table */}
        <div className="rounded-2xl border border-forge-border bg-forge-surface overflow-hidden animate-fade-up" style={{ animationDelay: "360ms" }}>
          <div className="px-6 py-4 border-b border-forge-border flex items-center justify-between">
            <div>
              <h2 className="font-bold text-forge-text">Attempt History</h2>
              <p className="text-xs text-forge-muted mt-0.5">{attempts.length} record{attempts.length !== 1 ? "s" : ""}</p>
            </div>
            {s.recentStreak > 1 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                🔥 {s.recentStreak}-quiz streak
              </span>
            )}
          </div>

          {attempts.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-forge-border/40 flex items-center justify-center text-3xl">📋</div>
              <p className="text-forge-muted text-sm">No quiz attempts yet</p>
              <Link to="/dashboard" className="text-forge-accent text-sm hover:underline">
                Browse quizzes →
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-forge-border">
                      {["Quiz", "Score", "Correct", "Time", "Status", "Date", ""].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-forge-muted uppercase tracking-wider first:pl-6 last:pr-6 last:text-right">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forge-border/50">
                    {attempts.map((a, idx) => {
                      const pct = Math.round(a.percentage ?? 0);
                      const color = scoreColor(pct);
                      const bg = scoreBg(pct);
                      return (
                        <tr
                          key={a.resultId}
                          className="hover:bg-forge-border/10 transition-colors group"
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          {/* Quiz name */}
                          <td className="px-5 py-4 pl-6">
                            <p className="font-medium text-forge-text text-sm leading-tight max-w-[200px] truncate">
                              {a.quizTitle}
                            </p>
                            <p className="text-[11px] text-forge-muted mt-0.5">
                              Attempt #{a.attemptNumber}
                            </p>
                          </td>

                          {/* Score */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="relative shrink-0">
                                <ScoreRing pct={pct} size={40} />
                                <span
                                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                                  style={{ color }}
                                >
                                  {pct}%
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-mono font-bold" style={{ color }}>
                                  {a.score ?? 0}/{a.totalPoints ?? 0}
                                </p>
                                <p className="text-[10px]" style={{ color: `${color}99` }}>
                                  {scoreLabel(pct)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Correct */}
                          <td className="px-5 py-4">
                            <p className="text-sm text-forge-text font-mono">
                              {a.correctCount ?? 0}
                              <span className="text-forge-muted">/{a.totalQuestions ?? 0}</span>
                            </p>
                          </td>

                          {/* Time */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-mono text-forge-text">
                              {formatDuration(a.timeTakenSeconds)}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            {a.evaluationStatus === "evaluated" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-forge-green/10 text-forge-green border border-forge-green/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-forge-green" />
                                Evaluated
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-forge-yellow/10 text-forge-yellow border border-forge-yellow/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-forge-yellow animate-pulse" />
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <p className="text-xs text-forge-muted">
                              {formatDate(a.submittedAt)}
                            </p>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 pr-6 text-right">
                            <Link
                              to={`/result/${a.quizId}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-forge-accent opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                            >
                              Result
                              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-forge-border/50">
                {attempts.map((a) => {
                  const pct = Math.round(a.percentage ?? 0);
                  const color = scoreColor(pct);
                  return (
                    <div key={a.resultId} className="p-4 flex items-center gap-4">
                      <div className="relative shrink-0">
                        <ScoreRing pct={pct} size={48} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-forge-text text-sm truncate">{a.quizTitle}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-forge-muted flex-wrap">
                          <span className="font-mono" style={{ color }}>{a.score}/{a.totalPoints} pts</span>
                          <span>·</span>
                          <span>{formatDuration(a.timeTakenSeconds)}</span>
                          <span>·</span>
                          <span>{formatDate(a.submittedAt)}</span>
                        </div>
                      </div>
                      <Link to={`/result/${a.quizId}`} className="text-forge-accent shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer nav */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-forge-muted/50">
          <Link to="/dashboard" className="hover:text-forge-accent transition-colors">← Quizzes</Link>
          <span>·</span>
          <Link to="/leaderboard" className="hover:text-forge-accent transition-colors">Leaderboard →</Link>
        </div>

      </main>
    </div>
  );
}
