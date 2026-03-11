/**
 * Renders a single MCQ question with selectable options.
 *
 * Props:
 *   question  – { _id, text, options: string[] }
 *   index     – question number (0-based)
 *   selected  – currently selected option index | null
 *   onChange  – (questionId, optionIndex) => void
 */
export default function QuestionCard({ question, index, selected, onChange }) {
  return (
    <div className="card animate-fade-up">
      {/* Question text */}
      <p className="font-display font-semibold text-forge-text mb-5 leading-relaxed">
        <span className="text-forge-accent font-mono mr-2">Q{index + 1}.</span>
        {question.text}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              onClick={() => onChange(question._id, i)}
              className={`text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150 ${
                isSelected
                  ? "border-forge-accent bg-forge-accent/10 text-forge-accent"
                  : "border-forge-border bg-forge-bg text-forge-muted hover:border-forge-accent/50 hover:text-forge-text"
              }`}
            >
              <span className="font-mono mr-3 opacity-60">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}