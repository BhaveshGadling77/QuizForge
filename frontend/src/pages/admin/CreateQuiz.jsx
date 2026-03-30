import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createQuiz } from "@/services/quizService";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

// ─── inline styles ────────────────────────────────────────────────────────────
const styles = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.93); }
    60%  { transform: scale(1.02); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .form-section { animation: fadeSlideUp .24s ease both; }
  .animate-slide-down { animation: slideDown .2s ease both; }
  .animate-pop-in { animation: popIn .25s cubic-bezier(.34,1.56,.64,1) both; }

  .input:focus { outline: none; box-shadow: 0 0 0 2px rgba(99,102,241,.4); }
  .input-field {
    width: 100%;
    padding: .625rem .875rem;
    border-radius: .75rem;
    border: 1px solid var(--forge-border, #1e293b);
    background: var(--forge-surface, #0f172a);
    font-size: .875rem;
    transition: border-color .15s, box-shadow .15s;
  }
  .input-field:focus {
    outline: none;
    border-color: rgba(99,102,241,.5);
    box-shadow: 0 0 0 2px rgba(99,102,241,.18);
  }
  .input-field::placeholder { opacity: .4; }

  .toggle-track {
    width: 40px; height: 22px; border-radius: 999px;
    transition: background .2s;
    position: relative; cursor: pointer; border: none;
    flex-shrink: 0;
  }
  .toggle-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 16px; height: 16px; border-radius: 50%;
    background: white; transition: transform .2s cubic-bezier(.34,1.56,.64,1);
  }
  .toggle-track.on  { background: var(--forge-accent, #6366f1); }
  .toggle-track.off { background: rgba(255,255,255,.12); }
  .toggle-track.on .toggle-thumb  { transform: translateX(18px); }

  .vis-card { transition: border-color .15s, background .15s; cursor: pointer; }
  .vis-card:hover { border-color: rgba(99,102,241,.4); }
  .vis-card.active {
    border-color: var(--forge-accent, #6366f1);
    background: rgba(99,102,241,.08);
  }

  .duration-btn { transition: background .15s, border-color .15s, color .15s; }
  .duration-btn.active {
    border-color: rgba(99,102,241,.5);
    background: rgba(99,102,241,.1);
    color: var(--forge-accent, #6366f1);
  }
  .duration-btn:not(.active):hover { border-color: rgba(99,102,241,.25); }

  .stepper-btn { transition: background .15s; border-radius: .5rem; }
  .stepper-btn:hover { background: rgba(99,102,241,.15); }

  .spinner { animation: spin .7s linear infinite; }
`;

// ─── Toggle ───────────────────────────────────────────────────────────────────
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
      {/* Presets */}
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

      {/* Stepper */}
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
          className={`vis-card flex flex-col gap-2 p-4 rounded-xl border border-forge-border ${value === opt.value ? "active" : "bg-forge-surface"}`}
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CreateQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 30,
    visibility: "public",
    accessToken: "",
    timerEnabled: true,
    autoSubmit: true,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        durationSeconds: form.duration * 60,
        visibility: form.visibility,
        accessToken: form.visibility === "private" ? form.accessToken : null,
        timerEnabled: form.timerEnabled,
        autoSubmit: form.autoSubmit,
        isActive: false,
        totalQuestions: 0,
        totalPoints: 0,
        createdBy: user._id || user.id || user.userId,
      };
      const res = await createQuiz(payload);
      const quizId = res.data.quiz.quizId || res.data.quiz.id || res.data.quiz._id;
      navigate(`/admin/quiz/${quizId}/questions`);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.title.trim().length > 0 && (form.visibility === "public" || form.accessToken.trim().length > 0);

  return (
    <div className="min-h-screen bg-forge-bg">
      <style>{styles}</style>
      <Navbar />

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
        <div className="mb-8 form-section">
          <h1 className="text-2xl font-bold tracking-tight">Create Quiz</h1>
          <p className="text-sm text-forge-muted mt-1">
            Set up your quiz details — you can add questions next.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-6">

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
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-pop-in">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            className={`btn-primary flex items-center justify-center gap-2 transition-all
              ${!isValid ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading || !isValid}
          >
            {loading ? (
              <>
                <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Quiz & Add Questions
              </>
            )}
          </button>

          {/* Hint */}
          <p className="text-center text-[11px] text-forge-muted/40 -mt-2">
            You'll be taken to the question editor right after.
          </p>
        </form>
      </main>
    </div>
  );
}