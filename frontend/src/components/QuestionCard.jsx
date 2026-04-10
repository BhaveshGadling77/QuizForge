import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

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
      <pre className="my-3 rounded-lg border border-forge-border overflow-x-auto text-xs leading-relaxed">
        {children}
      </pre>
    );
  },
  code({ className, children, ...props }) {
    // Block code (has a language-* class from rehype-highlight) — let hljs styles take over
    if (className?.startsWith("language-")) {
      return (
        <code className={`${className} px-4 py-3 block`} {...props}>
          {children}
        </code>
      );
    }
    // Inline code
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-forge-surface text-forge-accent font-mono text-[0.8em]"
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
      <h3 className="text-base font-semibold text-forge-text mb-2 leading-snug">
        {children}
      </h3>
    );
  },
  strong({ children }) {
    return <strong className="text-forge-text font-semibold">{children}</strong>;
  },
};

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight];

// ─── Badge config ────────────────────────────────────────────────
const TYPE_BADGE = {
  mcq:               { label: "MCQ",          color: "text-forge-accent bg-forge-accent/10 border-forge-accent/30" },
  "true-false":      { label: "True / False", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  "short-integer":   { label: "Numeric",      color: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  "short-subjective":{ label: "Subjective",   color: "text-violet-400 bg-violet-400/10 border-violet-400/30" },
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
  const qid  = question.id || question.questionId || question._id;
  const type = question.questionType || "mcq";
  const badge = TYPE_BADGE[type] || TYPE_BADGE.mcq;

  return (
    <div className="card animate-fade-up group transition-all duration-200 hover:border-forge-accent/30">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="shrink-0 font-mono text-sm font-bold text-forge-accent bg-forge-accent/10 border border-forge-accent/30 rounded-md px-2.5 py-1 leading-none">
          Q{index + 1}
        </span>
        <span className={`shrink-0 text-[10px] font-mono font-medium uppercase tracking-widest border rounded-full px-2.5 py-1 ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Question body — markdown + syntax highlighting */}
      <div className="text-forge-text text-sm leading-relaxed mb-5 prose prose-invert prose-sm max-w-none">
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
        <MCQOptions options={question.options} selected={selected} qid={qid} onChange={onChange} />
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
  );
}

// ─── MCQ ─────────────────────────────────────────────────────────
function MCQOptions({ options, selected, qid, onChange }) {
  if (!options?.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt, i) => {
        const isSelected = selected === i;
        return (
          <button
            key={i}
            onClick={() => onChange(qid, i)}
            className={`group/opt text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150 ${
              isSelected
                ? "border-forge-accent bg-forge-accent/10 text-forge-accent"
                : "border-forge-border bg-forge-bg text-forge-muted hover:border-forge-accent/50 hover:text-forge-text"
            }`}
          >
            <span className="inline-flex items-start gap-3">
              <span
                className={`shrink-0 font-mono text-xs mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                  isSelected
                    ? "border-forge-accent bg-forge-accent text-forge-bg"
                    : "border-forge-border text-forge-muted group-hover/opt:border-forge-accent/50"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="prose prose-invert prose-sm max-w-none leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                  components={mdComponents}
                >
                  {unescapeMd(opt)}
                </ReactMarkdown>
              </span>
            </span>
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
      {["True", "False"].map((label, i) => {
        const isSelected = selected === i;
        return (
          <button
            key={label}
            onClick={() => onChange(qid, i)}
            className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all duration-150 ${
              isSelected
                ? i === 0
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-rose-500 bg-rose-500/10 text-rose-400"
                : "border-forge-border bg-forge-bg text-forge-muted hover:border-forge-accent/50 hover:text-forge-text"
            }`}
          >
            <span className="mr-2">{i === 0 ? "✓" : "✗"}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Short integer ────────────────────────────────────────────────
function IntegerInput({ selected, qid, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-forge-muted font-mono">Enter a number</label>
      <input
        type="number"
        value={selected ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(qid, val === "" ? null : Number(val));
        }}
        placeholder="0"
        className="w-40 px-4 py-2.5 rounded-lg border border-forge-border bg-forge-bg text-forge-text text-sm font-mono
                   focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent/30
                   transition-all placeholder:text-forge-muted/40
                   [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}

// ─── Short subjective ─────────────────────────────────────────────
function SubjectiveInput({ selected, qid, onChange }) {
  const MAX = 800;
  const val = selected ?? "";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-forge-muted font-mono">Your answer</label>
      <textarea
        value={val}
        onChange={(e) => onChange(qid, e.target.value)}
        maxLength={MAX}
        rows={5}
        placeholder="Write your answer here…"
        className="w-full px-4 py-3 rounded-lg border border-forge-border bg-forge-bg text-forge-text text-sm
                   resize-y min-h-[120px]
                   focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent/30
                   transition-all placeholder:text-forge-muted/40 leading-relaxed"
      />
      <span className={`text-right text-[10px] font-mono ${val.length > MAX * 0.9 ? "text-amber-400" : "text-forge-muted"}`}>
        {val.length}/{MAX}
      </span>
    </div>
  );
}