import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getQuizById, updateQuiz, publishQuiz, unpublishQuiz } from "@/services/quizService";
import toast from "react-hot-toast";

// ─── Toggle (reused from CreateQuiz style) ───────────────────────────────────
function Toggle({ checked, onChange, label, desc }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border border-forge-border bg-forge-surface cursor-pointer hover:border-forge-accent/30 transition-colors"
      onClick={() => onChange(!checked)}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-forge-muted/60 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        className={`toggle-track ${checked ? "on" : "off"}`}
        onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  );
}

// ─── Duration Picker ──────────────────────────────────────────────────────────
const DURATION_PRESETS = [10, 15, 30, 45, 60, 90];

function DurationPicker({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`duration-btn px-3 py-1.5 rounded-lg text-xs font-semibold border border-forge-border ${value === d ? "active" : "text-forge-muted"}`}
          >
            {d}m
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-forge-border rounded-xl overflow-hidden bg-forge-surface">
          <button type="button" className="stepper-btn px-4 py-2 text-lg font-bold" onClick={() => onChange(Math.max(1, value - 1))}>−</button>
          <input
            type="number"
            min={1}
            value={value}
            onChange={(e) => onChange(+e.target.value || 1)}
            className="w-16 text-center bg-transparent py-2 text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button type="button" className="stepper-btn px-4 py-2 text-lg font-bold" onClick={() => onChange(value + 1)}>+</button>
        </div>
        <span className="text-xs text-forge-muted/60">minutes</span>
      </div>
    </div>
  );
}

// ─── Visibility Picker ────────────────────────────────────────────────────────
const VIS_OPTIONS = [
  {
    value: "public",
    label: "Public",
    desc: "Anyone with the link can take this quiz",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: "private",
    label: "Private",
    desc: "Requires an access token to join",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function VisibilityPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {VIS_OPTIONS.map((opt) => (
        <div
          key={opt.value}
          className={`vis-card flex flex-col gap-2 p-4 rounded-xl border border-forge-border cursor-pointer ${value === opt.value ? "active" : "bg-forge-surface"}`}
          onClick={() => onChange(opt.value)}
        >
          <div className={`${value === opt.value ? "text-forge-accent" : "text-forge-muted/60"} transition-colors`}>
            {opt.icon}
          </div>
          <div>
            <p className={`text-sm font-semibold ${value === opt.value ? "text-forge-accent" : ""}`}>{opt.label}</p>
            <p className="text-[11px] text-forge-muted/60 mt-0.5 leading-tight">{opt.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ label, letter, children, delay = 0 }) {
  return (
    <div className="form-section flex flex-col gap-2" style={{ animationDelay: `${delay}ms` }}>
      <label className="text-sm font-medium flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-forge-accent/10 border border-forge-accent/20 flex items-center justify-center text-forge-accent text-[10px] font-bold">
          {letter}
        </span>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ isActive, totalQuestions }) {
  const status = !isActive ? "DRAFT" : totalQuestions === 0 ? "EMPTY" : "PUBLISHED";
  const cfg = {
    PUBLISHED: { dot: "bg-emerald-400", chip: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", label: "Published" },
    DRAFT:     { dot: "bg-amber-400",   chip: "bg-amber-400/10 text-amber-400 border-amber-400/20",       label: "Draft" },
    EMPTY:     { dot: "bg-forge-muted/40", chip: "bg-forge-border/30 text-forge-muted border-forge-border", label: "Empty" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="h-4 w-32 rounded bg-forge-surface animate-pulse mb-6" />
        <div className="h-8 w-48 rounded bg-forge-surface animate-pulse mb-8" />
        <div className="card flex flex-col gap-6">
          {[120, 200, 160, 140].map((w, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 rounded bg-forge-surface animate-pulse" style={{ width: w }} />
              <div className="h-10 rounded-xl bg-forge-surface animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: quiz, isLoading } = useQuery(
    ["quiz", id],
    () => getQuizById(id).then((r) => r.data.quiz),
    { refetchOnWindowFocus: false }
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 30,
    visibility: "public",
    accessToken: "",
    timerEnabled: true,
    autoSubmit: true,
  });

  const [saving,      setSaving]      = useState(false);
  const [publishing,  setPublishing]  = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [error,       setError]       = useState("");
  const [saved,       setSaved]       = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (quiz) {
      setForm({
        title:        quiz.title        ?? "",
        description:  quiz.description  ?? "",
        duration:     quiz.durationSeconds ? Math.round(quiz.durationSeconds / 60) : (quiz.duration ?? 30),
        visibility:   quiz.visibility   ?? "public",
        accessToken:  quiz.accessToken  ?? "",
        timerEnabled: quiz.timerEnabled ?? true,
        autoSubmit:   quiz.autoSubmit   ?? true,
      });
    }
  }, [quiz]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title:           form.title,
        description:     form.description,
        durationSeconds: form.duration * 60,
        visibility:      form.visibility,
        accessToken:     form.visibility === "private" ? form.accessToken : null,
        timerEnabled:    form.timerEnabled,
        autoSubmit:      form.autoSubmit,
      };
      await updateQuiz(id, payload);
      toast.success("Quiz updated successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message ?? "Save failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    try {
      await publishQuiz(id);
      toast.success("Quiz published!");
      navigate("/admin");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Publish failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setUnpublishing(true);
    setError("");
    try {
      await unpublishQuiz(id);
      toast.success("Quiz unpublished.");
      navigate("/admin");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Unpublish failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setUnpublishing(false);
    }
  };

  const isChanged = () => {
    if (!quiz) return false;
    return (
      form.title !== (quiz.title ?? "") ||
      form.description !== (quiz.description ?? "") ||
      form.duration !== (quiz.durationSeconds ? Math.round(quiz.durationSeconds / 60) : (quiz.duration ?? 30)) ||
      form.visibility !== (quiz.visibility ?? "public") ||
      form.accessToken !== (quiz.accessToken ?? "") ||
      form.timerEnabled !== (quiz.timerEnabled ?? true) ||
      form.autoSubmit !== (quiz.autoSubmit ?? true)
    );
  };

  const isValid = form.title.trim().length > 0 &&
    (form.visibility === "public" || form.accessToken.trim().length > 0);
  
  const canSave = isValid && isChanged();

  if (isLoading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-forge-bg">

      <main className="max-w-xl mx-auto px-6 py-10">

        {/* Back */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-forge-muted hover:text-forge-accent transition-colors mb-6 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 form-section flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Quiz</h1>
            <p className="text-sm text-forge-muted mt-1">
              Update quiz settings — changes are saved immediately.
            </p>
          </div>
          {quiz && (
            <StatusBadge isActive={quiz.isActive} totalQuestions={quiz.totalQuestions ?? 0} />
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            to={`/admin/quiz/${id}/questions`}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-forge-border bg-forge-surface hover:border-forge-accent/40 hover:bg-forge-accent/5 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-forge-accent/10 flex items-center justify-center text-forge-accent group-hover:bg-forge-accent/20 transition-colors shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Questions</p>
              <p className="text-[11px] text-forge-muted/60 mt-0.5">
                {quiz?.totalQuestions ?? 0} added
              </p>
            </div>
          </Link>

          <Link
            to={`/admin/quiz/${id}/results`}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-forge-border bg-forge-surface hover:border-forge-accent/40 hover:bg-forge-accent/5 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-forge-accent/10 flex items-center justify-center text-forge-accent group-hover:bg-forge-accent/20 transition-colors shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Results</p>
              <p className="text-[11px] text-forge-muted/60 mt-0.5">View attempts</p>
            </div>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="card flex flex-col gap-6">

          {/* Title */}
          <Section label="Title" letter="T" delay={40}>
            <input
              className="input-field"
              placeholder="e.g. JavaScript Fundamentals"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Section>

          {/* Description */}
          <Section label="Description" letter="D" delay={80}>
            <textarea
              className="input-field resize-none"
              placeholder="A brief description of what this quiz covers…"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Section>

          {/* Duration */}
          <Section label="Duration" letter="⏱" delay={120}>
            <DurationPicker value={form.duration} onChange={(v) => set("duration", v)} />
          </Section>

          {/* Visibility */}
          <Section label="Visibility" letter="V" delay={160}>
            <VisibilityPicker value={form.visibility} onChange={(v) => set("visibility", v)} />
            {form.visibility === "private" && (
              <div className="animate-slide-down mt-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-muted/50 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  <input
                    className="input-field pl-9"
                    placeholder="Access token (shared with participants)"
                    value={form.accessToken}
                    onChange={(e) => set("accessToken", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </Section>

          {/* Settings toggles */}
          <Section label="Settings" letter="S" delay={200}>
            <div className="flex flex-col gap-2">
              <Toggle
                checked={form.timerEnabled}
                onChange={(v) => set("timerEnabled", v)}
                label="Timer Enabled"
                desc="Show a countdown clock during the quiz"
              />
              <Toggle
                checked={form.autoSubmit}
                onChange={(v) => set("autoSubmit", v)}
                label="Auto Submit"
                desc="Automatically submit when time runs out"
              />
            </div>
          </Section>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`btn-primary flex items-center justify-center gap-2 transition-all ${!canSave ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={saving || !canSave}
          >
            {saving ? (
              <>
                <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : saved ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z"/>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </form>

        {/* Publish / Unpublish */}
        <div className="mt-4 flex flex-col gap-3">
          {quiz?.isActive ? (
            <button
              onClick={handleUnpublish}
              disabled={unpublishing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-400 text-sm font-semibold hover:bg-amber-500/10 hover:border-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {unpublishing ? (
                <>
                  <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Unpublishing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                  </svg>
                  Unpublish Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing || (quiz?.totalQuestions ?? 0) === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {publishing ? (
                <>
                  <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Publishing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {(quiz?.totalQuestions ?? 0) === 0 ? "Add questions to publish" : "Publish Quiz"}
                </>
              )}
            </button>
          )}
        </div>

        {/* Bottom nav hint */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-forge-muted/40">
          <Link to={`/admin/quiz/${id}/questions`} className="hover:text-forge-accent transition-colors">
            Manage Questions →
          </Link>
          <span>·</span>
          <Link to="/admin" className="hover:text-forge-accent transition-colors">
            Back to Dashboard →
          </Link>
        </div>

      </main>
    </div>
  );
}