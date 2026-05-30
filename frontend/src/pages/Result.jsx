import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getResult } from "@/services/quizService";
import { scoreColor, calcScore } from "@/utils/helpers";

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

  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-md mx-auto px-6 py-16 text-center animate-fade-up">
        <div className="mb-8">
          <div className={`font-display font-bold text-7xl mb-2 ${scoreColor(score)}`}>
            {isEvaluated ? `${score}%` : "..."}
          </div>
          <p className="text-forge-muted text-sm font-mono">
            {isEvaluated ? `${correctCount} / ${result?.totalQuestions} correct` : "Evaluation Pending"}
          </p>
        </div>

        <div className={`card mb-6 grid gap-4 text-left ${pendingCount > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
          <StatCell label="Correct" value={correctCount} color="text-forge-green" />
          <StatCell label="Wrong" value={wrongCount} color="text-forge-red" />
          {pendingCount > 0 && (
            <StatCell label="Pending" value={pendingCount} color="text-forge-yellow" />
          )}
          <StatCell label="Time" value={`${result?.timeTakenSeconds || 0}s`} color="text-forge-text" />
        </div>

        <div className="flex flex-col gap-2">
          <Link to={`/leaderboard/${id}`} className="btn-primary block">
            View Leaderboard →
          </Link>
          <Link to="/dashboard" className="btn-ghost block">
            Back to Quizzes
          </Link>
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
