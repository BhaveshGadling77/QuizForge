import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import MDEditor from "@uiw/react-md-editor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import {
  getQuestions,
  addQuestion,
  deleteQuestion,
} from "@/services/quizService";
import Navbar from "@/components/Navbar";

// ─── utils ───────────────────────────────────────────────────────────────────
const cleanData = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

const emptyForm = () => ({
  questionMd: "",
  questionType: "mcq",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  correctAnswer: null,
  points: 10,
});

// ─── type config ─────────────────────────────────────────────────────────────
const TYPE_CONFIG = [
  {
    value: "mcq",
    label: "Multiple Choice",
    short: "MCQ",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="10" cy="10" r="3.5" />
      </svg>
    ),
    desc: "4 options, one correct",
  },
  {
    value: "true-false",
    label: "True / False",
    short: "T/F",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M5 10l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
    desc: "Binary choice",
  },
  {
    value: "short-integer",
    label: "Short Integer",
    short: "123",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <text x="3" y="15" fontSize="13" fontWeight="bold" fill="currentColor">42</text>
      </svg>
    ),
    desc: "Numeric answer",
  },
  {
    value: "short-subjective",
    label: "Subjective",
    short: "Text",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M3 5h14M3 9h10M3 13h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
    desc: "Free-form text",
  },
];

// ─── inline styles (no new CSS file needed) ──────────────────────────────────
const styles = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.92) translateY(8px); }
    60%  { transform: scale(1.02) translateY(-1px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
    70%  { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
    100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .animate-slide-down  { animation: slideDown .22s ease both; }
  .animate-fade-in     { animation: fadeIn .18s ease both; }
  .animate-slide-up    { animation: slideUp .25s ease both; }
  .animate-pop-in      { animation: popIn .3s cubic-bezier(.34,1.56,.64,1) both; }
  .pulse-ring          { animation: pulse-ring 1.4s ease-out; }
  .delete-btn:hover svg { transform: scale(1.15); }

  /* progress bar glow */
  .progress-fill {
    transition: width .6s cubic-bezier(.4,0,.2,1);
    background: linear-gradient(90deg,
      var(--forge-accent, #6366f1) 0%,
      #818cf8 50%,
      var(--forge-accent, #6366f1) 100%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
  }

  /* option row hover */
  .option-row { transition: background .15s, border-color .15s; }
  .option-row:hover { background: rgba(99,102,241,.06); }
  .option-row.selected { background: rgba(99,102,241,.12); border-color: rgba(99,102,241,.5); }

  /* type pill */
  .type-pill { transition: all .18s ease; }
  .type-pill:hover  { transform: translateY(-1px); }
  .type-pill.active { transform: translateY(-1px); }

  /* input focus ring */
  .input:focus { outline: none; box-shadow: 0 0 0 2px rgba(99,102,241,.45); }

  /* card hover */
  .question-card { transition: box-shadow .2s, border-color .2s, transform .2s; }
  .question-card:hover { transform: translateY(-2px); }

  /* points stepper */
  .stepper-btn { transition: background .15s, color .15s; }
  .stepper-btn:hover { background: rgba(99,102,241,.2); color: #a5b4fc; }
`;

// ─── sub-components ──────────────────────────────────────────────────────────

function TypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {TYPE_CONFIG.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`type-pill flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-medium
              ${active
                ? "border-forge-accent bg-forge-accent/10 text-forge-accent"
                : "border-forge-border bg-forge-surface text-forge-muted hover:border-forge-accent/50 hover:text-forge-accent/80"
              }`}
          >
            <span className={`${active ? "text-forge-accent" : "opacity-60"}`}>
              {t.icon}
            </span>
            <span className="font-semibold">{t.short}</span>
            <span className="opacity-60 text-[10px] leading-tight text-center">{t.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

function OptionRow({ index, value, checked, onChange, onCheck, isReadonly }) {
  return (
    <label
      className={`option-row flex items-center gap-3 px-4 py-3 rounded-xl border border-forge-border cursor-pointer
        ${checked ? "selected" : ""}`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150
          ${checked ? "border-forge-accent" : "border-forge-border"}`}
        onClick={onCheck}
      >
        {checked && (
          <div className="w-2.5 h-2.5 rounded-full bg-forge-accent animate-pop-in" />
        )}
      </div>

      {isReadonly ? (
        <span className="text-sm flex-1">{value}</span>
      ) : (
        <input
          className="bg-transparent flex-1 text-sm outline-none placeholder-forge-muted/50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Option ${index + 1}`}
          required
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {checked && (
        <span className="text-[10px] font-semibold text-forge-accent uppercase tracking-wider">
          correct
        </span>
      )}
    </label>
  );
}

function PointsStepper({ value, onChange }) {
  const presets = [5, 10, 20, 50];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center border border-forge-border rounded-xl overflow-hidden">
        <button
          type="button"
          className="stepper-btn px-4 py-2 text-lg font-bold"
          onClick={() => onChange(Math.max(1, value - 1))}
        >−</button>
        <input
          type="number"
          className="w-14 text-center bg-transparent py-2 text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          min={1}
          onChange={(e) => onChange(+e.target.value || 1)}
        />
        <button
          type="button"
          className="stepper-btn px-4 py-2 text-lg font-bold"
          onClick={() => onChange(value + 1)}
        >+</button>
      </div>

      <div className="flex gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
              ${value === p
                ? "border-forge-accent bg-forge-accent/10 text-forge-accent"
                : "border-forge-border hover:border-forge-accent/40 opacity-60 hover:opacity-100"
              }`}
          >
            {p}pt
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ count }) {
  const MAX = 20;
  const pct = Math.min((count / MAX) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-forge-border rounded-full overflow-hidden">
        <div className="progress-fill h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs opacity-50 tabular-nums">{count} / {MAX}</span>
    </div>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────
function QuestionCard({ q, index, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const MAX_LENGTH = 140;
  const isLong = q.questionMd?.length > MAX_LENGTH;
  const displayText =
    !expanded && isLong
      ? q.questionMd.slice(0, MAX_LENGTH) + "..."
      : q.questionMd;

  const typeCfg = TYPE_CONFIG.find((t) => t.value === q.questionType);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
  };

  return (
    <div
      className={`question-card relative mb-3 p-5 rounded-2xl border border-forge-border bg-forge-surface
        ${deleting ? "opacity-50 pointer-events-none" : "hover:shadow-xl hover:border-forge-accent/30"}`}
      style={{ animation: "popIn .3s cubic-bezier(.34,1.56,.64,1) both" }}
    >
      {/* index badge + type pill */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-forge-accent/10 border border-forge-accent/20 flex items-center justify-center text-xs font-bold text-forge-accent">
            {index + 1}
          </span>
          {typeCfg && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-forge-border/50 text-[10px] font-semibold opacity-70">
              {typeCfg.icon} {typeCfg.short}
            </span>
          )}
          <span className="text-[10px] font-semibold text-forge-accent/60 border border-forge-accent/20 rounded-md px-2 py-0.5">
            {q.points} pts
          </span>
        </div>

        <button
          onClick={handleDelete}
          className="delete-btn group flex items-center gap-1 text-xs text-red-500/60 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
        >
          <svg className="w-3.5 h-3.5 transition-transform duration-150" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm0 3h2l.5 1H8.5L9 5zm-3 3a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1zm8 0a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Delete
        </button>
      </div>

      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {displayText}
        </ReactMarkdown>
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-forge-accent text-xs mt-2 hover:underline flex items-center gap-1"
        >
          {expanded ? (
            <>Show less <span>↑</span></>
          ) : (
            <>Show more <span>↓</span></>
          )}
        </button>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AddQuestions() {
  const { id } = useParams();
  const qc = useQueryClient();
  const formRef = useRef(null);

  const { data: questions = [], isLoading } = useQuery(
    ["questions", id],
    () => getQuestions(id).then((r) => r.data.questions)
  );

  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successFlash, setSuccessFlash] = useState(false);

  const setOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  const handleTypeChange = (type) => {
    if (type === "true-false") {
      setForm({ ...form, questionType: type, options: ["True", "False"], correctOptionIndex: 0, correctAnswer: null });
    } else if (type === "mcq") {
      setForm({ ...form, questionType: type, options: ["", "", "", ""], correctOptionIndex: 0, correctAnswer: null });
    } else {
      setForm({ ...form, questionType: type, options: null, correctOptionIndex: null, correctAnswer: "" });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload = { ...form, order: questions.length + 1, createdAt: new Date().toISOString() };
      if (form.questionType === "short-integer" || form.questionType === "short-subjective") {
        payload.options = null;
        payload.correctOptionIndex = null;
      }
      payload = cleanData(payload);
      await addQuestion(id, payload);
      qc.invalidateQueries(["questions", id]);
      setForm(emptyForm());
      setError("");
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 1800);
      // scroll to top of form
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qid) => {
    await deleteQuestion(id, qid);
    qc.invalidateQueries(["questions", id]);
  };

  const isMdEmpty = !form.questionMd.trim();

  return (
    <div className="min-h-screen bg-forge-bg">
      <style>{styles}</style>
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight">Add Questions</h1>
            <span className="text-sm font-semibold text-forge-accent/70 px-3 py-1 rounded-full border border-forge-accent/20 bg-forge-accent/5">
              {questions.length} added
            </span>
          </div>
          <ProgressBar count={questions.length} />
        </div>

        {/* ── Form ── */}
        <form
          ref={formRef}
          onSubmit={handleAdd}
          className={`card flex flex-col gap-6 mb-8 transition-all duration-300
            ${successFlash ? "ring-2 ring-green-500/40 shadow-green-500/10 shadow-xl" : ""}`}
        >

          {/* Question markdown */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-forge-accent/10 border border-forge-accent/20 flex items-center justify-center text-forge-accent text-[10px] font-bold">Q</span>
              Question
            </label>
            <div className="rounded-xl overflow-hidden border border-forge-border bg-forge-surface">
              <MDEditor
                value={form.questionMd}
                onChange={(val) => setForm({ ...form, questionMd: val || "" })}
                preview="edit"
                height={200}
                data-color-mode="dark"
                style={{ backgroundColor: "#0f172a" }}
              />
            </div>
            {isMdEmpty && (
              <p className="text-[11px] text-forge-muted/50 mt-1.5 ml-1">
                Supports Markdown — bold, code blocks, LaTeX, etc.
              </p>
            )}
          </div>

          {/* Type selector */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-forge-accent/10 border border-forge-accent/20 flex items-center justify-center text-forge-accent text-[10px] font-bold">T</span>
              Question Type
            </label>
            <TypeSelector value={form.questionType} onChange={handleTypeChange} />
          </div>

          {/* Options (MCQ / T-F) */}
          {(form.questionType === "mcq" || form.questionType === "true-false") && (
            <div className="animate-slide-down">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-forge-accent/10 border border-forge-accent/20 flex items-center justify-center text-forge-accent text-[10px] font-bold">O</span>
                Options
                <span className="text-[10px] opacity-50 font-normal">(click radio to mark correct)</span>
              </label>
              <div className="flex flex-col gap-2">
                {form.options.map((opt, i) => (
                  <OptionRow
                    key={i}
                    index={i}
                    value={opt}
                    checked={form.correctOptionIndex === i}
                    onCheck={() => setForm({ ...form, correctOptionIndex: i })}
                    onChange={(val) => setOption(i, val)}
                    isReadonly={form.questionType === "true-false"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Short answer */}
          {(form.questionType === "short-integer" || form.questionType === "short-subjective") && (
            <div className="animate-slide-down">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-forge-accent/10 border border-forge-accent/20 flex items-center justify-center text-forge-accent text-[10px] font-bold">A</span>
                Correct Answer
              </label>
              <input
                className="input w-full"
                type={form.questionType === "short-integer" ? "number" : "text"}
                value={form.correctAnswer ?? ""}
                placeholder={form.questionType === "short-integer" ? "e.g. 42" : "Enter expected answer…"}
                onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
              />
            </div>
          )}

          {/* Points */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-forge-accent/10 border border-forge-accent/20 flex items-center justify-center text-forge-accent text-[10px] font-bold">★</span>
              Points
            </label>
            <PointsStepper value={form.points} onChange={(v) => setForm({ ...form, points: v })} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            className={`btn-primary relative overflow-hidden flex items-center justify-center gap-2 transition-all duration-200
              ${saving ? "opacity-75 cursor-not-allowed" : ""}
              ${successFlash ? "!bg-green-600 !border-green-500" : ""}`}
            disabled={saving || isMdEmpty}
          >
            {successFlash ? (
              <>
                <svg className="w-4 h-4 animate-pop-in" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Question Added!
              </>
            ) : saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Question
              </>
            )}
          </button>
        </form>

        {/* ── Question List ── */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-forge-border bg-forge-surface h-24 animate-pulse" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-forge-muted/50 animate-fade-in">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm">No questions yet — add your first one above!</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-40 mb-3">
              Questions ({questions.length})
            </p>
            {questions.map((q, i) => (
              <QuestionCard
                key={q.questionId}
                q={q}
                index={i}
                onDelete={() => handleDelete(q.questionId)}
              />
            ))}
          </>
        )}

        <Link to="/admin" className="btn-primary mt-6 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Done — Back to Admin
        </Link>
      </main>
    </div>
  );
}