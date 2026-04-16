import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { getQuestions, updateQuestion } from "@/services/quizService";
import toast from "react-hot-toast";

// ─── utils ────────────────────────────────────────────────────────────────────
const cleanData = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

// ─── type config (identical to AddQuestions) ─────────────────────────────────
const TYPE_CONFIG = [
  {
    value: "mcq",
    label: "Multiple Choice",
    short: "MCQ",
    color: "#6366f1",
    desc: "4 options, one correct",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "true-false",
    label: "True / False",
    short: "T / F",
    color: "#10b981",
    desc: "Binary choice",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M4 10.5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "short-integer",
    label: "Integer",
    short: "123",
    color: "#f59e0b",
    desc: "Numeric answer",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <text x="3" y="15" fontSize="12" fontWeight="700" fill="currentColor" fontFamily="monospace">42</text>
      </svg>
    ),
  },
  {
    value: "short-subjective",
    label: "Subjective",
    short: "Text",
    color: "#ec4899",
    desc: "Free-form text",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M3 5h14M3 9h10M3 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── Markdown Toolbar Actions ─────────────────────────────────────────────────
const MD_ACTIONS = [
  { label: "B",   wrap: ["**", "**"],           title: "Bold",        style: { fontWeight: 800 } },
  { label: "I",   wrap: ["_", "_"],             title: "Italic",      style: { fontStyle: "italic" } },
  { label: "`",   wrap: ["`", "`"],             title: "Inline code", style: { fontFamily: "monospace" } },
  { label: "```", wrap: ["\n```\n", "\n```\n"], title: "Code block",  style: { fontFamily: "monospace", fontSize: "11px" } },
  { label: "$$",  wrap: ["$$", "$$"],           title: "LaTeX block", style: { fontFamily: "serif" } },
  { label: "H1",  prefix: "# ",                title: "Heading 1",   style: { fontWeight: 700 } },
  { label: "H2",  prefix: "## ",               title: "Heading 2",   style: { fontWeight: 600 } },
  { label: "—",   insert: "---",               title: "Divider",     style: {} },
  { label: "[ ]", insert: "- [ ] ",            title: "Checklist",   style: {} },
];

// ─── MarkdownToolbar ──────────────────────────────────────────────────────────
function MarkdownToolbar({ textareaRef, value, onChange }) {
  const applyAction = (action) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start    = ta.selectionStart;
    const end      = ta.selectionEnd;
    const selected = value.slice(start, end);
    let newVal, cursor;

    if (action.insert) {
      newVal = value.slice(0, start) + action.insert + value.slice(end);
      cursor = start + action.insert.length;
    } else if (action.prefix) {
      newVal = value.slice(0, start) + action.prefix + selected + value.slice(end);
      cursor = start + action.prefix.length + selected.length;
    } else if (action.wrap) {
      const [pre, post] = action.wrap;
      newVal = value.slice(0, start) + pre + selected + post + value.slice(end);
      cursor = start + pre.length + selected.length + post.length;
    }

    onChange(newVal);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = cursor; }, 0);
  };

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/[0.07] overflow-x-auto">
      {MD_ACTIONS.map((a) => (
        <button
          key={a.label}
          type="button"
          title={a.title}
          onClick={() => applyAction(a)}
          style={a.style}
          className="shrink-0 min-w-[28px] h-7 px-2 rounded-md text-[11px] text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150"
        >
          {a.label}
        </button>
      ))}
      <div className="ml-auto shrink-0 text-[10px] text-white/20 font-mono tracking-tight">
        {value.length} chars
      </div>
    </div>
  );
}

// ─── SplitMdEditor ────────────────────────────────────────────────────────────
function SplitMdEditor({ value, onChange }) {
  const taRef = useRef(null);
  const [mode, setMode] = useState("split");

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = taRef.current;
      const start = ta.selectionStart;
      const newVal = value.slice(0, start) + "  " + value.slice(start);
      onChange(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.09] bg-[#0c0e16]" style={{ minHeight: 260 }}>
      <div className="flex items-center border-b border-white/[0.07]">
        <MarkdownToolbar textareaRef={taRef} value={value} onChange={onChange} />
      </div>

      <div className="flex items-center gap-0 px-3 pt-2 pb-0">
        {[["edit", "Edit"], ["split", "Split"], ["preview", "Preview"]].map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`text-[11px] font-semibold px-3 py-1 rounded-t-lg border-b-2 transition-all duration-150 mr-1
              ${mode === m
                ? "border-[#6366f1] text-[#818cf8] bg-[#6366f1]/10"
                : "border-transparent text-white/30 hover:text-white/60"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`flex ${mode === "split" ? "divide-x divide-white/[0.07]" : ""}`} style={{ minHeight: 200 }}>
        {(mode === "edit" || mode === "split") && (
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"Write your question in Markdown…\n\nExamples:\n**Bold** text, `code`, $$LaTeX$$"}
            className="flex-1 resize-none bg-transparent text-[13px] font-mono text-white/80 placeholder-white/20 p-4 outline-none leading-relaxed"
            style={{ minHeight: 200 }}
          />
        )}
        {(mode === "preview" || mode === "split") && (
          <div className="flex-1 p-4 overflow-auto" style={{ minHeight: 200 }}>
            {value.trim() ? (
              <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/15 text-sm italic select-none">
                Preview will appear here…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── OptionMdEditor ───────────────────────────────────────────────────────────
function OptionMdEditor({ value, onChange, placeholder }) {
  const taRef = useRef(null);
  const [preview, setPreview] = useState(false);

  const applyAction = (action) => {
    const ta = taRef.current;
    if (!ta) return;
    const start    = ta.selectionStart;
    const end      = ta.selectionEnd;
    const selected = value.slice(start, end);
    let newVal, cursorStart, cursorEnd;

    if (action.insert) {
      newVal = value.slice(0, start) + action.insert + value.slice(end);
      cursorStart = cursorEnd = start + action.insert.length;
    } else if (action.prefix) {
      newVal = value.slice(0, start) + action.prefix + selected + value.slice(end);
      cursorStart = cursorEnd = start + action.prefix.length + selected.length;
    } else if (action.wrap) {
      const [pre, post] = action.wrap;
      const text = selected || "text";
      newVal = value.slice(0, start) + pre + text + post + value.slice(end);
      cursorStart = start + pre.length;
      cursorEnd   = start + pre.length + text.length;
    }

    onChange(newVal);
    setTimeout(() => { ta.focus(); ta.selectionStart = cursorStart; ta.selectionEnd = cursorEnd; }, 0);
  };

  return (
    <div className="flex-1 rounded-xl overflow-hidden border border-white/[0.07] bg-[#0c0e16]" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/[0.06]">
        {MD_ACTIONS.slice(0, 5).map((a) => (
          <button
            key={a.label}
            type="button"
            title={a.title}
            style={a.style}
            onClick={() => applyAction(a)}
            className="shrink-0 min-w-[22px] h-5 px-1.5 rounded text-[10px] text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            {a.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ml-auto text-[10px] px-2 h-5 rounded font-semibold transition-all duration-150"
          style={{
            background: preview ? "rgba(99,102,241,0.2)" : "transparent",
            color:      preview ? "#818cf8" : "rgba(255,255,255,0.3)",
          }}
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div className="px-3 py-2 min-h-[40px]">
          {value.trim() ? (
            <div className="prose prose-invert prose-sm max-w-none text-white/80 text-[13px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <span className="text-white/20 italic text-xs">Nothing to preview…</span>
          )}
        </div>
      ) : (
        <textarea
          ref={taRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const ta = taRef.current;
              const start = ta.selectionStart;
              const newVal = value.slice(0, start) + "  " + value.slice(start);
              onChange(newVal);
              setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
            }
          }}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-[13px] text-white/80 placeholder-white/20 px-3 py-2 outline-none leading-relaxed"
          style={{ minHeight: 40 }}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}

// ─── TypeSelector ─────────────────────────────────────────────────────────────
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
            className="relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left overflow-hidden transition-all duration-200"
            style={{
              borderColor: active ? t.color : "rgba(255,255,255,0.08)",
              background:  active ? `${t.color}18` : "rgba(255,255,255,0.02)",
              boxShadow:   active ? `0 0 20px ${t.color}22` : "none",
            }}
          >
            {active && (
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ background: `radial-gradient(circle at 20% 20%, ${t.color}, transparent 70%)` }}
              />
            )}
            <span style={{ color: active ? t.color : "rgba(255,255,255,0.35)" }}>{t.icon}</span>
            <div>
              <div className="text-[11px] font-bold tracking-wide" style={{ color: active ? t.color : "rgba(255,255,255,0.7)" }}>{t.short}</div>
              <div className="text-[10px] mt-0.5" style={{ color: active ? `${t.color}bb` : "rgba(255,255,255,0.3)" }}>{t.desc}</div>
            </div>
            {active && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── OptionRow ────────────────────────────────────────────────────────────────
function OptionRow({ index, value, checked, onChange, onCheck, isMcq }) {
  const LETTERS = ["A", "B", "C", "D"];
  return (
    <label
      className="group flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150"
      style={{
        borderColor: checked ? "#6366f1" : "rgba(255,255,255,0.07)",
        background:  checked ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
        alignItems:  isMcq ? "flex-start" : "center",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-150"
        style={{
          background: checked ? "#6366f1" : "rgba(255,255,255,0.06)",
          color:      checked ? "#fff"    : "rgba(255,255,255,0.4)",
          marginTop:  isMcq ? "6px" : "0",
        }}
        onClick={(e) => { e.preventDefault(); onCheck(); }}
      >
        {LETTERS[index]}
      </div>

      {isMcq ? (
        <OptionMdEditor value={value} onChange={onChange} placeholder={`Option ${LETTERS[index]}… (Markdown supported)`} />
      ) : (
        <span className="text-sm flex-1 text-white/80">{value}</span>
      )}

      <div
        className="shrink-0 flex items-center gap-1.5 transition-all duration-200"
        style={{ opacity: checked ? 1 : 0.25, marginTop: isMcq ? "10px" : "0" }}
        onClick={(e) => { e.preventDefault(); onCheck(); }}
      >
        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: checked ? "#6366f1" : "rgba(255,255,255,0.2)" }}>
          {checked && <div className="w-2 h-2 rounded-full bg-[#6366f1]" />}
        </div>
        {checked && <span className="text-[9px] font-bold text-[#818cf8] uppercase tracking-widest">correct</span>}
      </div>
    </label>
  );
}

// ─── PointsStepper ────────────────────────────────────────────────────────────
function PointsStepper({ value, onChange }) {
  const presets = [5, 10, 20, 50];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center rounded-xl border border-white/[0.09] bg-white/[0.03] overflow-hidden">
        <button type="button"
          className="w-10 h-10 flex items-center justify-center text-lg font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150"
          onClick={() => onChange(Math.max(1, value - 1))}>−</button>
        <input
          type="number"
          className="w-14 text-center bg-transparent py-2 text-sm font-bold outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value} min={1}
          onChange={(e) => onChange(+e.target.value || 1)}
        />
        <button type="button"
          className="w-10 h-10 flex items-center justify-center text-lg font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150"
          onClick={() => onChange(value + 1)}>+</button>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {presets.map((p) => (
          <button key={p} type="button" onClick={() => onChange(p)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150"
            style={{
              borderColor: value === p ? "#6366f1" : "rgba(255,255,255,0.08)",
              background:  value === p ? "rgba(99,102,241,0.15)" : "transparent",
              color:       value === p ? "#818cf8" : "rgba(255,255,255,0.4)",
            }}
          >
            {p} pts
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ letter, children, sublabel }) {
  return (
    <label className="flex items-center gap-2.5 mb-3">
      <div className="w-6 h-6 rounded-lg bg-[#6366f1]/15 border border-[#6366f1]/25 flex items-center justify-center text-[10px] font-black text-[#818cf8]">
        {letter}
      </div>
      <span className="text-sm font-semibold text-white/80">{children}</span>
      {sublabel && <span className="text-[11px] text-white/25 font-normal">{sublabel}</span>}
    </label>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}`}</style>
      <div className="flex flex-col gap-6">
        {[260, 80, 120, 60].map((h, i) => (
          <div key={i} className="rounded-2xl" style={{
            height: h,
            background: "linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.03) 75%)",
            backgroundSize: "200% auto",
            animation: "shimmer 1.6s linear infinite",
          }} />
        ))}
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EditQuestion() {
  const { id: quizId, questionId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: questions = [], isLoading } = useQuery(
    ["questions", quizId],
    () => getQuestions(quizId).then((r) => r.data.questions)
  );

  const [form, setForm]                 = useState(null);
  const [saving, setSaving]             = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (!questions.length) return;
    const q = questions.find((q) => q.questionId === questionId);
    if (q) {
      setForm({
        questionMd:         q.questionMd ?? "",
        questionType:       q.questionType ?? "mcq",
        options:            q.options ?? ["", "", "", ""],
        correctOptionIndex: q.correctOptionIndex ?? 0,
        correctAnswer:      q.correctAnswer ?? "",
        points:             q.points ?? 10,
      });
    }
  }, [questions, questionId]);

  const questionIndex = questions.findIndex((q) => q.questionId === questionId);

  const handleTypeChange = (type) => {
    if (type === "true-false") {
      setForm({ ...form, questionType: type, options: ["True", "False"], correctOptionIndex: 0, correctAnswer: null });
    } else if (type === "mcq") {
      setForm({ ...form, questionType: type, options: ["", "", "", ""], correctOptionIndex: 0, correctAnswer: null });
    } else {
      setForm({ ...form, questionType: type, options: null, correctOptionIndex: null, correctAnswer: "" });
    }
  };

  const setOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let payload = { ...form };
      if (form.questionType === "short-integer" || form.questionType === "short-subjective") {
        payload.options            = null;
        payload.correctOptionIndex = null;
      }
      payload = cleanData(payload);
      await updateQuestion(quizId, questionId, payload);
      qc.invalidateQueries(["questions", quizId]);
      toast.success("Question updated successfully!");
      setSuccessFlash(true);
      setTimeout(() => navigate(`/admin/quiz/${quizId}/questions`), 900);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to save changes");
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const isMdEmpty = !form?.questionMd?.trim();

  return (
    <div className="min-h-screen" style={{ background: "#080a12" }}>

      <main className="max-w-3xl mx-auto px-5 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <Link
            to={`/admin/quiz/${quizId}/questions`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/30 hover:text-white/70 transition-colors mb-5 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Questions
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6366f1]/60 mb-1">Quiz Builder</p>
              <h1 className="text-[26px] font-black text-white leading-tight tracking-tight">Edit Question</h1>
              {!isLoading && questionIndex >= 0 && (
                <p className="text-[12px] text-white/30 mt-1">
                  Question {questionIndex + 1} of {questions.length}
                </p>
              )}
            </div>

            {/* Prev / Next */}
            {!isLoading && questions.length > 1 && (
              <div className="flex gap-2 shrink-0">
                {[
                  { label: "← Prev", disabled: questionIndex <= 0, delta: -1 },
                  { label: "Next →", disabled: questionIndex >= questions.length - 1, delta: 1 },
                ].map(({ label, disabled, delta }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    onClick={() => navigate(`/admin/quiz/${quizId}/questions/${questions[questionIndex + delta].questionId}/edit`)}
                    className="px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all duration-150"
                    style={{
                      borderColor: disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                      color:       disabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
                      cursor:      disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Form ── */}
        {isLoading || !form ? (
          <Skeleton />
        ) : (
          <div
            className="rounded-3xl border p-6 transition-all duration-500"
            style={{
              borderColor: successFlash ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)",
              background:  "rgba(255,255,255,0.02)",
              boxShadow:   successFlash ? "0 0 40px rgba(16,185,129,0.08)" : "none",
            }}
          >
            <form onSubmit={handleSave} className="flex flex-col gap-7">

              {/* Question */}
              <div>
                <SectionLabel letter="Q" sublabel="Markdown supported">Question</SectionLabel>
                <SplitMdEditor value={form.questionMd} onChange={(val) => setForm({ ...form, questionMd: val })} />
              </div>

              <div className="h-px bg-white/[0.05]" />

              {/* Type */}
              <div>
                <SectionLabel letter="T">Question Type</SectionLabel>
                <TypeSelector value={form.questionType} onChange={handleTypeChange} />
              </div>

              {/* MCQ options */}
              {form.questionType === "mcq" && (
                <div>
                  <SectionLabel letter="O" sublabel="Markdown supported · click letter to mark correct">Options</SectionLabel>
                  <div className="flex flex-col gap-2">
                    {form.options.map((opt, i) => (
                      <OptionRow key={i} index={i} value={opt}
                        checked={form.correctOptionIndex === i}
                        onCheck={() => setForm({ ...form, correctOptionIndex: i })}
                        onChange={(val) => setOption(i, val)}
                        isMcq={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* True/False */}
              {form.questionType === "true-false" && (
                <div>
                  <SectionLabel letter="O" sublabel="click letter to mark correct">Options</SectionLabel>
                  <div className="flex flex-col gap-2">
                    {form.options.map((opt, i) => (
                      <OptionRow key={i} index={i} value={opt}
                        checked={form.correctOptionIndex === i}
                        onCheck={() => setForm({ ...form, correctOptionIndex: i })}
                        onChange={() => {}}
                        isMcq={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Short answer */}
              {(form.questionType === "short-integer" || form.questionType === "short-subjective") && (
                <div>
                  <SectionLabel letter="A">Correct Answer</SectionLabel>
                  <input
                    className="w-full px-4 py-3 rounded-xl text-[13px] outline-none text-white/80 placeholder-white/20 transition-all duration-150"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}
                    type={form.questionType === "short-integer" ? "number" : "text"}
                    value={form.correctAnswer ?? ""}
                    placeholder={form.questionType === "short-integer" ? "e.g. 42" : "Enter expected answer…"}
                    onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                  />
                </div>
              )}

              <div className="h-px bg-white/[0.05]" />

              {/* Points */}
              <div>
                <SectionLabel letter="★">Points</SectionLabel>
                <PointsStepper value={form.points} onChange={(v) => setForm({ ...form, points: v })} />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 text-red-400 text-xs bg-red-500/[0.08] border border-red-500/20 rounded-2xl px-4 py-3">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  to={`/admin/quiz/${quizId}/questions`}
                  className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center border transition-all duration-200 text-white/40 hover:text-white/70"
                  style={{ borderColor: "rgba(255,255,255,0.09)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving || isMdEmpty}
                  className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: successFlash
                      ? "linear-gradient(135deg,#059669,#10b981)"
                      : isMdEmpty || saving
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg,#4f46e5,#6366f1)",
                    color:     isMdEmpty && !saving ? "rgba(255,255,255,0.25)" : "#fff",
                    boxShadow: !isMdEmpty && !saving && !successFlash ? "0 4px 20px rgba(99,102,241,0.35)" : "none",
                    cursor:    isMdEmpty || saving ? "not-allowed" : "pointer",
                  }}
                >
                  {successFlash ? (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Saved!
                    </>
                  ) : saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}