import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useState } from "react";
import {
  Hash,
  Type,
  ToggleLeft,
  Binary,
  AlignLeft,
  Check,
  X,
  Circle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/**
 * Firestore sometimes double-escapes newlines (\\n → \n).
 * Normalise before passing to ReactMarkdown.
 */
function unescapeMd(str) {
  if (!str) return "";
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");
}

// rehype-highlight injects hljs token classes onto <code>.
// We only need to style the <pre> shell and inline <code>.
const mdComponents = {
  pre({ children }) {
    return (
      <pre className="my-3 rounded-lg border border-white/10 overflow-x-auto text-xs leading-relaxed bg-[#0f0f1a]">
        {children}
      </pre>
    );
  },
  code({ className, children, ...props }) {
    if (className?.startsWith("language-")) {
      return (
        <code className={`${className} px-4 py-3 block`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-white/10 text-purple-300 font-mono text-[0.8em] border border-white/10"
        {...props}
      >
        {children}
      </code>
    );
  },
  p({ children }) {
    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
  },
  h3({ children }) {
    return (
      <h3 className="text-base font-semibold text-slate-100 mb-2 leading-snug">
        {children}
      </h3>
    );
  },
  strong({ children }) {
    return <strong className="text-slate-100 font-semibold">{children}</strong>;
  },
};

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight];

// ─── Badge config ────────────────────────────────────────────────
const TYPE_BADGE = {
  mcq: {
    label: "MCQ",
    icon: Hash,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    accent: "purple",
  },
  "true-false": {
    label: "True / False",
    icon: ToggleLeft,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    accent: "amber",
  },
  "short-integer": {
    label: "Numeric",
    icon: Binary,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    accent: "sky",
  },
  "short-subjective": {
    label: "Subjective",
    icon: AlignLeft,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    accent: "emerald",
  },
};

// ─── Main component ──────────────────────────────────────────────
/**
 * Props:
 *   question  – { id, question, options, questionType }
 *   index     – question number (0-based)
 *   selected  – current answer (option index | string | null)
 *   onChange  – (questionId, value) => void
 */
export default function QuestionCard({ question, index, selected, onChange }) {
  const qid = question.id || question.questionId || question._id;
  const type = question.questionType || "mcq";
  const badge = TYPE_BADGE[type] || TYPE_BADGE.mcq;
  const BadgeIcon = badge.icon;

  return (
    <div className="group relative rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/15 transition-all duration-300 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            {/* Question number */}
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <span className="font-mono text-sm font-bold text-purple-400">
                {index + 1}
              </span>
            </div>

            {/* Type badge */}
            <div
              className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest border rounded-full px-3 py-1.5 ${badge.color}`}
            >
              <BadgeIcon size={11} />
              {badge.label}
            </div>
          </div>

          {/* Status indicator */}
          {selected !== null && selected !== undefined && selected !== "" ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 size={14} />
              <span className="hidden sm:inline">Answered</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Circle size={14} />
              <span className="hidden sm:inline">Pending</span>
            </div>
          )}
        </div>

        {/* Question body — markdown + syntax highlighting */}
        <div className="text-slate-200 text-sm leading-relaxed mb-6 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={mdComponents}
          >
            {unescapeMd(question.question)}
          </ReactMarkdown>
        </div>

        {/* Answer input per question type */}
        {type === "mcq" && (
          <MCQOptions
            options={question.options}
            selected={selected}
            qid={qid}
            onChange={onChange}
          />
        )}
        {type === "true-false" && (
          <TrueFalseToggle selected={selected} qid={qid} onChange={onChange} />
        )}
        {type === "short-integer" && (
          <IntegerInput selected={selected} qid={qid} onChange={onChange} />
        )}
        {type === "short-subjective" && (
          <SubjectiveInput selected={selected} qid={qid} onChange={onChange} />
        )}
      </div>
    </div>
  );
}

// ─── MCQ ─────────────────────────────────────────────────────────
function MCQOptions({ options, selected, qid, onChange }) {
  if (!options?.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt, i) => {
        const isSelected = selected === i;
        const letter = String.fromCharCode(65 + i);

        return (
          <button
            key={i}
            onClick={() => onChange(qid, i)}
            className={`group/opt relative text-left w-full p-4 rounded-xl border text-sm transition-all duration-200 ${
              isSelected
                ? "border-purple-500/40 bg-purple-500/10 text-purple-200 shadow-sm shadow-purple-500/10"
                : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-purple-500/30 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            <span className="inline-flex items-start gap-3.5">
              {/* Letter circle */}
              <span
                className={`shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono border transition-all duration-200 ${
                  isSelected
                    ? "border-purple-500 bg-purple-500 text-white shadow-md shadow-purple-500/30"
                    : "border-white/15 text-slate-500 group-hover/opt:border-purple-500/40 group-hover/opt:text-slate-300"
                }`}
              >
                {isSelected ? <Check size={14} strokeWidth={2.5} /> : letter}
              </span>

              {/* Option text */}
              <span className="prose prose-invert prose-sm max-w-none leading-relaxed pt-0.5">
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                  components={mdComponents}
                >
                  {unescapeMd(opt)}
                </ReactMarkdown>
              </span>
            </span>

            {/* Selected glow line */}
            {isSelected && (
              <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-purple-500 to-violet-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── True / False ─────────────────────────────────────────────────
function TrueFalseToggle({ selected, qid, onChange }) {
  return (
    <div className="flex gap-3">
      {[
        { label: "True", value: 0, icon: Check, color: "emerald" },
        { label: "False", value: 1, icon: X, color: "rose" },
      ].map(({ label, value, icon: Icon, color }) => {
        const isSelected = selected === value;
        const colorMap = {
          emerald: {
            active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-sm shadow-emerald-500/10",
            icon: "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30",
            inactive: "border-white/10 bg-white/[0.02] text-slate-400 hover:border-emerald-500/30 hover:bg-white/[0.04]",
            iconInactive: "border-white/15 text-slate-500 group-hover:border-emerald-500/40 group-hover:text-slate-300",
          },
          rose: {
            active: "border-rose-500/40 bg-rose-500/10 text-rose-300 shadow-sm shadow-rose-500/10",
            icon: "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30",
            inactive: "border-white/10 bg-white/[0.02] text-slate-400 hover:border-rose-500/30 hover:bg-white/[0.04]",
            iconInactive: "border-white/15 text-slate-500 group-hover:border-rose-500/40 group-hover:text-slate-300",
          },
        };
        const c = colorMap[color];

        return (
          <button
            key={label}
            onClick={() => onChange(qid, value)}
            className={`group/tf flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
              isSelected ? c.active : c.inactive
            }`}
          >
            <span
              className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all duration-200 ${
                isSelected ? c.icon : c.iconInactive
              }`}
            >
              <Icon size={14} strokeWidth={2.5} />
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Short integer ────────────────────────────────────────────────
function IntegerInput({ selected, qid, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-xs text-slate-500 font-mono uppercase tracking-wider">
        <Binary size={12} className="text-sky-400" />
        Enter a number
      </label>
      <div className="relative">
        <input
          type="number"
          value={selected ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange(qid, val === "" ? null : Number(val));
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          className={`w-48 px-4 py-3 rounded-xl border bg-white/[0.03] text-slate-100 text-sm font-mono
            focus:outline-none focus:ring-2 transition-all duration-300
            placeholder:text-slate-700
            [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
            ${focused ? "border-sky-500/50 ring-sky-500/20 ring-2" : "border-white/10 hover:border-white/20"}`}
        />
        {selected !== null && selected !== undefined && selected !== "" && (
          <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
        )}
      </div>
    </div>
  );
}

// ─── Short subjective ─────────────────────────────────────────────
function SubjectiveInput({ selected, qid, onChange }) {
  const MAX = 800;
  const val = selected ?? "";
  const nearLimit = val.length > MAX * 0.85;

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-xs text-slate-500 font-mono uppercase tracking-wider">
        <AlignLeft size={12} className="text-emerald-400" />
        Your answer
      </label>
      <div className="relative">
        <textarea
          value={val}
          onChange={(e) => onChange(qid, e.target.value)}
          maxLength={MAX}
          rows={5}
          placeholder="Write your answer here…"
          className={`w-full px-4 py-3.5 rounded-xl border bg-white/[0.03] text-slate-100 text-sm
            resize-y min-h-[120px] leading-relaxed
            focus:outline-none focus:ring-2 transition-all duration-300
            placeholder:text-slate-700
            ${nearLimit ? "border-amber-500/40 focus:ring-amber-500/20" : "border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 hover:border-white/20"}`}
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-[10px] font-mono flex items-center gap-1 ${nearLimit ? "text-amber-400" : "text-slate-600"}`}>
            {nearLimit && <AlertCircle size={10} />}
            {val.length > 0 ? `${val.length} characters` : "Start typing…"}
          </span>
          <span className={`text-[10px] font-mono ${nearLimit ? "text-amber-400" : "text-slate-600"}`}>
            {val.length}/{MAX}
          </span>
        </div>
      </div>
    </div>
  );
}