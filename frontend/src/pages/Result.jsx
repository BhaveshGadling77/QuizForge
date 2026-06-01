import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { getResult } from "@/services/quizService";
import { scoreColor, calcScore } from "@/utils/helpers";

function unescapeMd(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");
}

const mdComponents = {
  pre({ children }) {
    return (
      <pre className="my-3 rounded-lg border border-forge-border overflow-x-auto text-xs leading-relaxed">
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
  strong({ children }) {
    return <strong className="text-forge-text font-semibold">{children}</strong>;
  },
};

function MarkdownText({ children, className = "" }) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={mdComponents}
      >
        {unescapeMd(children)}
      </ReactMarkdown>
    </div>
  );
}

export default function Result() {
  const { id } = useParams();
  const { data: result, isLoading, isFetching } = useQuery(["result", id], () =>
    getResult(id).then((r) => r.data.data),
    { refetchOnMount: "always" }
  );

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-forge-bg">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <p className="font-mono text-forge-muted text-sm animate-pulse">Calculating results…</p>
        </div>
      </div>
    );
  }

  const isEvaluated = result?.evaluationStatus === "evaluated";
  const pendingCount = result?.answers?.filter(a => typeof a.isCorrect !== "boolean").length || 0;
  const correctCount = result?.correctCount || 0;
  const wrongCount = (result?.totalQuestions || 0) - correctCount - pendingCount;
  const score = calcScore(correctCount, result?.totalQuestions);

  const getStudentAnswer = (ans) => {
    if (ans.submittedAnswer !== null && ans.submittedAnswer !== undefined && String(ans.submittedAnswer).trim() !== "") {
      return String(ans.submittedAnswer);
    }
    if (ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined) {
      const option = ans.options?.[ans.selectedOptionIndex];
      return option ? <MarkdownText>{option}</MarkdownText> : `Option ${ans.selectedOptionIndex + 1}`;
    }
    return <span className="italic opacity-50 text-forge-muted">Skipped / No Answer</span>;
  };

  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-3xl mx-auto px-6 py-16 animate-fade-up">
        <div className="text-center mb-8">
          <div className={`font-display font-bold text-7xl mb-2 ${scoreColor(score)}`}>
            {isEvaluated ? `${score}%` : "..."}
          </div>
          <p className="text-forge-muted text-sm font-mono">
            {isEvaluated ? `${correctCount} / ${result?.totalQuestions} correct` : "Evaluation Pending"}
          </p>
        </div>

        <div className={`card mb-8 grid gap-4 text-left ${pendingCount > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
          <StatCell label="Correct" value={correctCount} color="text-forge-green" />
          <StatCell label="Wrong" value={wrongCount} color="text-forge-red" />
          {pendingCount > 0 && (
            <StatCell label="Pending" value={pendingCount} color="text-forge-yellow" />
          )}
          <StatCell label="Time" value={`${result?.timeTakenSeconds || 0}s`} color="text-forge-text" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
          <Link to={`/leaderboard/${id}`} className="btn-primary text-center">
            View Leaderboard →
          </Link>
          <Link to="/dashboard" className="btn-ghost text-center">
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          <h2 className="font-display font-bold text-xl text-forge-text border-b border-forge-border pb-2 mb-4">
            Question Breakdown
          </h2>
          {result?.answerBreakdown?.map((ans, idx) => (
            <div key={ans.questionId} className="card p-5 border border-forge-border bg-forge-surface/40 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-2 flex-1 min-w-0 text-forge-text text-sm">
                  <span className="text-forge-muted mr-2">{idx + 1}.</span>
                  <MarkdownText>{ans.question}</MarkdownText>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border ${
                  ans.isCorrect === true ? "bg-forge-green/10 text-forge-green border-forge-green/20" :
                  ans.isCorrect === false ? "bg-forge-red/10 text-forge-red border-forge-red/20" :
                  "bg-forge-yellow/10 text-forge-yellow border-forge-yellow/20"
                }`}>
                  {ans.isCorrect === true ? "Correct" : ans.isCorrect === false ? "Incorrect" : "Pending"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-forge-bg rounded-lg p-3 border border-forge-border/50 text-sm">
                  <span className="text-xs font-semibold text-forge-muted uppercase tracking-wider block mb-1">Your Answer</span>
                  <div className="text-forge-text break-words">
                    {getStudentAnswer(ans)}
                  </div>
                </div>
                
                {isEvaluated && (ans.correctAnswer !== undefined || ans.correctOptionIndex !== undefined) ? (
                  <div className="bg-forge-green/5 rounded-lg p-3 border border-forge-green/20 text-sm">
                    <span className="text-xs font-semibold text-forge-green uppercase tracking-wider block mb-1">Correct Answer</span>
                    <div className="text-forge-green break-words">
                      {ans.correctAnswer !== undefined && ans.correctAnswer !== null && String(ans.correctAnswer).trim() !== ""
                        ? <MarkdownText className="text-forge-green">{ans.correctAnswer}</MarkdownText>
                        : (ans.correctOptionIndex !== undefined && ans.correctOptionIndex !== null
                            ? (ans.options?.[ans.correctOptionIndex]
                                ? <MarkdownText className="text-forge-green">{ans.options[ans.correctOptionIndex]}</MarkdownText>
                                : `Option ${ans.correctOptionIndex + 1}`)
                            : <span className="italic opacity-50">Manual Evaluation</span>
                          )
                      }
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="flex justify-end text-xs font-mono">
                <span className="text-forge-muted">
                  Points: <span className="font-bold text-forge-text">{ans.pointsEarned}</span> / {ans.maxPoints}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatCell({ label, value, color }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className={`font-mono font-bold text-xl ${color}`}>{value}</p>
    </div>
  );
}
