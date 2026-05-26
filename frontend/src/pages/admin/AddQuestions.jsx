import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import {
  getQuestions,
  addQuestion,
  deleteQuestion,
} from "@/services/quizService";
import toast from "react-hot-toast";

// ─── utils ─────────────────────────────────────────────────────────────────
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

// ─── type config ────────────────────────────────────────────────────────────
const TYPE_CONFIG = [
  {
    value: "mcq",
    label: "Multiple Choice",
    short: "MCQ",
    color: "#6366f1",
    desc: "4 options, one correct",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="3" fill="currentColor"/>
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
        <path d="M4 10.5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
        <path d="M3 5h14M3 9h10M3 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ─── Markdown Toolbar Actions ────────────────────────────────────────────────
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

// ─── Markdown Toolbar ────────────────────────────────────────────────────────
function MarkdownToolbar({ textareaRef, value, onChange }) {
  const applyAction = (action) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const selected = value.slice(start, end);
    let newVal, cursor;

    if (action.insert) {
      newVal  = value.slice(0, start) + action.insert + value.slice(end);
      cursor  = start + action.insert.length;
    } else if (action.prefix) {
      newVal  = value.slice(0, start) + action.prefix + selected + value.slice(end);
      cursor  = start + action.prefix.length + selected.length;
    } else if (action.wrap) {
      const [pre, post] = action.wrap;
      newVal  = value.slice(0, start) + pre + selected + post + value.slice(end);
      cursor  = start + pre.length + selected.length + post.length;
    }

    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = cursor;
    }, 0);
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
          className="toolbar-btn shrink-0 min-w-[28px] h-7 px-2 rounded-md text-[11px] text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150"
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

// ─── Split MD Editor (full — used for Question field) ────────────────────────
function SplitMdEditor({ value, onChange }) {
  const taRef = useRef(null);
  const [mode, setMode] = useState("split");

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta    = taRef.current;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const newVal = value.slice(0, start) + "  " + value.slice(end);
      onChange(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  return (
    <div className="split-editor rounded-2xl overflow-hidden border border-white/[0.09] bg-[#0c0e16]" style={{ minHeight: 260 }}>
      <div className="flex items-center border-b border-white/[0.07]">
        <MarkdownToolbar textareaRef={taRef} value={value} onChange={onChange} />
      </div>

      <div className="flex items-center gap-0 px-3 pt-2 pb-0">
        {[["edit","Edit"], ["split","Split"], ["preview","Preview"]].map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`text-[11px] font-semibold px-3 py-1 rounded-t-lg border-b-2 transition-all duration-150 mr-1
              ${mode === m
                ? "border-[#6366f1] text-[#818cf8] bg-[#6366f1]/10"
                : "border-transparent text-white/30 hover:text-white/60"}`}
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
            placeholder={"Write your question in Markdown…\n\nExamples:\n**Bold** text, `code`, $$LaTeX$$\n```python\nprint('code block')\n```"}
            className="editor-textarea flex-1 resize-none bg-transparent text-[13px] font-mono text-white/80 placeholder-white/20 p-4 outline-none leading-relaxed"
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

// ─── Option MD Editor (mini — used only for MCQ options) ─────────────────────
function OptionMdEditor({ value, onChange, placeholder }) {
  const taRef   = useRef(null);
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

      // If nothing selected — insert placeholder
      const text = selected || "text";

      newVal =
        value.slice(0, start) +
        pre +
        text +
        post +
        value.slice(end);

      cursorStart = start + pre.length;
      cursorEnd   = start + pre.length + text.length;
    }

    onChange(newVal);

    setTimeout(() => {
      ta.focus();
      ta.selectionStart = cursorStart;
      ta.selectionEnd   = cursorEnd;
    }, 0);
  };

  return (
    <div
      className="flex-1 rounded-xl overflow-hidden border border-white/[0.07] bg-[#0c0e16]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mini toolbar — only first 5 actions (B I ` ``` $$) */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/[0.06]">
        {MD_ACTIONS.slice(0, 5).map((a) => (
          <button
            key={a.label}
            type="button"
            title={a.title}
            style={a.style}
            onClick={() => applyAction(a)}
            className="toolbar-btn shrink-0 min-w-[22px] h-5 px-1.5 rounded text-[10px] text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            {a.label}
          </button>
        ))}

        {/* Preview toggle */}
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

      {/* Pane */}
      {preview ? (
        <div className="px-3 py-2 min-h-[40px]">
          {value.trim() ? (
            <div className="prose prose-invert prose-sm max-w-none text-white/80 text-[13px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {value}
              </ReactMarkdown>
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
              const ta    = taRef.current;
              const start = ta.selectionStart;
              const newVal = value.slice(0, start) + "  " + value.slice(start);
              onChange(newVal);
              setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
            }
          }}
          placeholder={placeholder}
          className="editor-textarea w-full resize-none bg-transparent text-[13px] text-white/80 placeholder-white/20 px-3 py-2 outline-none leading-relaxed"
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
            className="type-pill relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left overflow-hidden transition-all duration-200"
            style={{
              borderColor: active ? t.color : "rgba(255,255,255,0.08)",
              background:  active ? `${t.color}18` : "rgba(255,255,255,0.02)",
              boxShadow:   active ? `0 0 20px ${t.color}22` : "none",
            }}
          >
            {active && (
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ background: `radial-gradient(circle at 20% 20%, ${t.color}, transparent 70%)` }}
              />
            )}
            <span style={{ color: active ? t.color : "rgba(255,255,255,0.35)" }}>{t.icon}</span>
            <div>
              <div className="text-[11px] font-bold tracking-wide" style={{ color: active ? t.color : "rgba(255,255,255,0.7)" }}>
                {t.short}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: active ? `${t.color}bb` : "rgba(255,255,255,0.3)" }}>
                {t.desc}
              </div>
            </div>
            {active && (
              <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
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
function OptionRow({ index, value, checked, onChange, onCheck, isMcq, isDuplicate }) {
  const LETTERS = ["A", "B", "C", "D"];
  return (
    <label
      className="option-row group flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150"
      style={{
        borderColor: isDuplicate
                  ? "#ef4444"
                  : checked
                  ? "#6366f1"
                  : "rgba(255,255,255,0.07)",

                background: isDuplicate
                  ? "rgba(239,68,68,0.08)"
                  : checked
                  ? "rgba(99,102,241,0.1)"
                  : "rgba(255,255,255,0.02)",
        alignItems:  isMcq ? "flex-start" : "center",
      }}
      onClick={(e) => { e.preventDefault(); onCheck(); }}
    >
      {/* Letter badge */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-150 mt-1"
        style={{
          background: checked ? "#6366f1" : "rgba(255,255,255,0.06)",
          color:      checked ? "#fff"     : "rgba(255,255,255,0.4)",
          marginTop:  isMcq ? "6px" : "0",
        }}
        onClick={(e) => { e.preventDefault(); onCheck(); }}
      >
        {LETTERS[index]}
      </div>

      {/* Content — MD editor for MCQ, plain text for true-false */}
      {isMcq ? (
        <OptionMdEditor
          value={value}
          onChange={onChange}
          placeholder={`Option ${LETTERS[index]}… (Markdown supported)`}
        />
      ) : (
        <span className="text-sm flex-1 text-white/80">{value}</span>
      )}

      {/* Correct indicator */}
      <div
        className="shrink-0 flex items-center gap-1.5 transition-all duration-200"
        style={{
          opacity:   checked ? 1 : 0.25,
          marginTop: isMcq ? "10px" : "0",
        }}
        
      >
        <div
          className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: checked ? "#6366f1" : "rgba(255,255,255,0.2)" }}
        >
          {checked && <div className="w-2 h-2 rounded-full bg-[#6366f1]" />}
        </div>
        {checked && <span className="text-[9px] font-bold text-[#818cf8] uppercase tracking-widest">correct</span>}
      </div>
    </label>
  );
}

// ─── PointsStepper ─────────────────────────────────────────────────────────
function PointsStepper({ value, onChange }) {
  const presets = [5, 10, 20, 50];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center rounded-xl border border-white/[0.09] bg-white/[0.03] overflow-hidden">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-lg font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150"
          onClick={() => onChange(Math.max(1, value - 1))}
        >−</button>
        <input
          type="number"
          className="w-14 text-center bg-transparent py-2 text-sm font-bold outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          min={1}
          onChange={(e) => onChange(+e.target.value || 1)}
        />
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-lg font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150"
          onClick={() => onChange(value + 1)}
        >+</button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
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

// ─── ProgressBar ─────────────────────────────────────────────────────────────
function ProgressBar({ count }) {
  const MAX = 20;
  const pct   = Math.min((count / MAX) * 100, 100);
  const color = pct >= 80 ? "#ef4444" : pct >= 50 ? "#f59e0b" : "#6366f1";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width:      `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow:  `0 0 8px ${color}66`,
          }}
        />
      </div>
      <span className="text-[11px] tabular-nums font-mono" style={{ color: `${color}99` }}>
        {count} / {MAX}
      </span>
    </div>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────
function QuestionCard({ q, index, onDelete }) {
  const [expanded,      setExpanded]      = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const MAX_LENGTH = 160;
  const isLong     = (q.questionMd?.length || 0) > MAX_LENGTH;
  const displayText = !expanded && isLong
    ? q.questionMd.slice(0, MAX_LENGTH) + "…"
    : q.questionMd;

  const typeCfg = TYPE_CONFIG.find((t) => t.value === q.questionType);

  const handleDeleteClick = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    onDelete();
  };

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const handleEdit = () => navigate(`/admin/quiz/${id}/questions/${q.questionId}/edit`);

  return (
    <div
      className="qcard relative rounded-2xl border p-5 mb-3 transition-all duration-300"
      style={{
        borderColor: deleting ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)",
        background:  deleting ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)",
        opacity:     deleting ? 0.5 : 1,
        animation:   "cardIn .35s cubic-bezier(.34,1.56,.64,1) both",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
            style={{ background: `${typeCfg?.color || "#6366f1"}20`, color: typeCfg?.color || "#6366f1" }}
          >
            {index + 1}
          </div>
          {typeCfg && (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: `${typeCfg.color}15`, color: typeCfg.color }}
            >
              {typeCfg.icon}
              {typeCfg.short}
            </span>
          )}
          <span className="px-2 py-1 rounded-lg text-[10px] font-bold text-white/40 bg-white/[0.05] border border-white/[0.06]">
            ★ {q.points} pts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200"
            style={{
              background: "rgba(99,102,241,0.15)",
              color:      "#818cf8",
              border:     "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586z"/>
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
            </svg>
            Edit
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200"
            style={{
              background: confirmDelete ? "rgba(239,68,68,0.15)" : "transparent",
              color:      confirmDelete ? "#f87171" : "rgba(255,255,255,0.25)",
              border:     confirmDelete ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
            }}
          >
            {confirmDelete ? (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Confirm?
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd"/>
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {displayText}
        </ReactMarkdown>
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[11px] text-[#818cf8] hover:text-[#a5b4fc] flex items-center gap-1 transition-colors"
        >
          {expanded ? "Show less ↑" : "Show more ↓"}
        </button>
      )}
    </div>
  );
}

// ─── Section Label ─────────────────────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AddQuestions() {
  const { id } = useParams();
  const qc     = useQueryClient();
  const formTopRef = useRef(null);
  
  const { data: questions = [], isLoading } = useQuery(
    ["questions", id],
    () => getQuestions(id).then((r) => r.data.questions)
  );

  const [form,         setForm]         = useState(emptyForm());
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [successFlash, setSuccessFlash] = useState(false);

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
    opts[i]    = val;
    setForm({ ...form, options: opts });
  };
  // ─── Normalize Markdown Text ──────────────────────────────────────────────
  const normalizeMarkdown = (text = "") => {
    return text
      // code blocks
      .replace(/```[\s\S]*?```/g, (m) =>
        m.replace(/```/g, "")
      )

      // inline code
      .replace(/`([^`]*)`/g, "$1")

      // bold / italic
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")

      // strikethrough
      .replace(/~~(.*?)~~/g, "$1")

      // latex
      .replace(/\$\$(.*?)\$\$/gs, "$1")
      .replace(/\$(.*?)\$/g, "$1")

      // headings
      .replace(/^#{1,6}\s+/gm, "")

      // blockquotes
      .replace(/^>\s+/gm, "")

      // markdown links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

      // images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")

      // checklist / bullets
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/^\s*-\s\[\s?\]\s+/gm, "")

      // horizontal rules
      .replace(/^---$/gm, "")

      // html tags
      .replace(/<[^>]+>/g, "")

      // collapse whitespace
      .replace(/\s+/g, " ")

      .trim()
      .toLowerCase();
  };
  // ─── Duplicate Option Checker ─────────────────────────────────────────────
  const getDuplicateIndexes = useCallback(() => {
    if (form.questionType !== "mcq") return [];

    const normalized = form.options.map((o) =>
      normalizeMarkdown(o)
    );

    const duplicates = [];

    normalized.forEach((opt, idx) => {
      if (!opt) return;

      const firstIndex = normalized.indexOf(opt);

      if (firstIndex !== idx || normalized.lastIndexOf(opt) !== idx) {
        duplicates.push(idx);
      }
    });

    return duplicates;
  }, [form.options, form.questionType]);

  const duplicateIndexes = getDuplicateIndexes();
  const hasDuplicateOptions = duplicateIndexes.length > 0;
  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (hasDuplicateOptions) {
      setError("Duplicate options are not allowed");
      setSaving(false);
      return;
    }
    try {
      let payload = { ...form, order: questions.length + 1, createdAt: new Date().toISOString() };
      if (form.questionType === "short-integer" || form.questionType === "short-subjective") {
        payload.options           = null;
        payload.correctOptionIndex = null;
      }
      payload = cleanData(payload);
      const response = await addQuestion(id, payload);
      // console.log(response) //debug
      if (response.data.success) {
        toast.success("Question added successfully!");
      } else {
        toast.error("Failed to add question: " + (response.data.message || "Unknown error"));
      }
      qc.invalidateQueries(["questions", id]);
      setForm(emptyForm());
      setError("");
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 2000);
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qid) => {
    const response = await deleteQuestion(id, qid);
    if (response.data.success) {
      toast.success("Question deleted successfully!");
    } else {
      toast.error("Failed to delete question: " + (response.data.message || "Unknown error"));
    }
    qc.invalidateQueries(["questions", id]);
  };

  const isMdEmpty = !form.questionMd.trim();

  return (
    <div className="add-questions-root min-h-screen" style={{ background: "#080a12" }}>

      <main className="max-w-7xl mx-auto px-5 py-10" ref={formTopRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left Column: Existing Questions ── */}
          <div>

          {/* ── Header ── */}
            <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6366f1]/60 mb-1">Quiz Builder</p>
                <h1 className="text-[26px] font-black text-white leading-tight tracking-tight">Add Questions</h1>
              </div>
              <div
                className="px-4 py-2 rounded-2xl border text-center"
                style={{
                  borderColor: questions.length >= 15 ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.2)",
                  background:  questions.length >= 15 ? "rgba(239,68,68,0.08)" : "rgba(99,102,241,0.06)",
                }}
              >
                <div
                  className="text-2xl font-black tabular-nums"
                  style={{ color: questions.length >= 15 ? "#f87171" : "#818cf8" }}
                >
                  {questions.length}
                </div>
                <div className="text-[10px] font-semibold text-white/30 mt-0.5">of 20</div>
              </div>
            </div>
            <ProgressBar count={questions.length} />
          </div>
          
          

          {/* ── Form Card ── */}
          <div
            className={`form-card rounded-3xl border p-6 mb-8 transition-all duration-500 ${successFlash ? "success-burst" : ""}`}
            style={{
              borderColor: successFlash ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)",
              background:  "rgba(255,255,255,0.02)",
            }}
          >
            <form onSubmit={handleAdd} className="flex flex-col gap-7">

              {/* ── Section 1: Question ── */}
              <div>
                <SectionLabel letter="Q" sublabel="Markdown supported">Question</SectionLabel>
                <SplitMdEditor
                  value={form.questionMd}
                  onChange={(val) => setForm({ ...form, questionMd: val })}
                />
              </div>

              <div className="h-px bg-white/[0.05]" />

              {/* ── Section 2: Type ── */}
              <div>
                <SectionLabel letter="T">Question Type</SectionLabel>
                <TypeSelector value={form.questionType} onChange={handleTypeChange} />
              </div>

              {/* ── Section 3a: MCQ options (with MD editor) ── */}
              {form.questionType === "mcq" && (
                <div className="slide-down">
                  <SectionLabel letter="O" sublabel="Markdown supported · click radio to mark correct">Options</SectionLabel>
                  <div className="flex flex-col gap-2">
                    {form.options.map((opt, i) => (
                      <OptionRow
                        key={i}
                        index={i}
                        value={opt}
                        checked={form.correctOptionIndex === i}
                        onCheck={() => setForm({ ...form, correctOptionIndex: i })}
                        onChange={(val) => setOption(i, val)}
                        isMcq={true}
                        isDuplicate={duplicateIndexes.includes(i)}
                      />
                    ))}
                    {hasDuplicateOptions && (
                      <div className="mt-2 text-xs text-red-400 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Duplicate options detected
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Section 3b: True/False options (plain text, no MD editor) ── */}
              {form.questionType === "true-false" && (
                <div className="slide-down">
                  <SectionLabel letter="O" sublabel="click radio to mark correct">Options</SectionLabel>
                  <div className="flex flex-col gap-2">
                    {form.options.map((opt, i) => (
                      <OptionRow
                        key={i}
                        index={i}
                        value={opt}
                        checked={form.correctOptionIndex === i}
                        onCheck={() => setForm({ ...form, correctOptionIndex: i })}
                        onChange={() => {}}
                        isMcq={false}
                        isDuplicate={duplicateIndexes.includes(i)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section 3c: Short answer ── */}
              {(form.questionType === "short-integer" || form.questionType === "short-subjective") && (
                <div className="slide-down">
                  <SectionLabel letter="A">Correct Answer</SectionLabel>
                  <input
                    className="field-input"
                    type={form.questionType === "short-integer" ? "number" : "text"}
                    value={form.correctAnswer ?? ""}
                    placeholder={form.questionType === "short-integer" ? "e.g. 42" : "Enter expected answer…"}
                    onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                  />
                </div>
              )}

              <div className="h-px bg-white/[0.05]" />

              {/* ── Section 4: Points ── */}
              <div>
                <SectionLabel letter="★">Points</SectionLabel>
                <PointsStepper value={form.points} onChange={(v) => setForm({ ...form, points: v })} />
              </div>

              {/* ── Error ── */}
              {error && (
                <div className="flex items-center gap-2.5 text-red-400 text-xs bg-red-500/[0.08] border border-red-500/20 rounded-2xl px-4 py-3 fade-in">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={saving || isMdEmpty}
                className="relative h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 overflow-hidden"
                style={{
                  background: successFlash
                    ? "linear-gradient(135deg, #059669, #10b981)"
                    : isMdEmpty || saving
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #4f46e5, #6366f1)",
                  color:     isMdEmpty && !saving ? "rgba(255,255,255,0.25)" : "#fff",
                  boxShadow: !isMdEmpty && !saving && !successFlash ? "0 4px 20px rgba(99,102,241,0.35)" : "none",
                  cursor:    isMdEmpty || saving ? "not-allowed" : "pointer",
                }}
              >
                {successFlash ? (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Question Added!
                  </>
                ) : saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Adding…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Add Question
                  </>
                )}
              </button>
            </form>
          </div>
          </div>
          <div className="sticky top-6 h-fit">

          {/* ── Question List ── */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] h-24 animate-pulse"/>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 fade-in">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm text-white/30">No questions yet</p>
              <p className="text-xs text-white/15 mt-1">Add your first one above ↑</p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">
                Questions · {questions.length}
              </p>
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.questionId}
                  q={q}
                  index={i}
                  onDelete={() => handleDelete(q.questionId)}
                  onEdit={() => handleEdit(q.questionId)}
                />
              ))}
            </div>
          )}

          {/* ── Done ── */}
          <Link
            to="/admin"
            className="mt-8 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-white/[0.09] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Done — Back to Admin
          </Link>
          </div>
        </div>
      </main>
    </div>
  );
}