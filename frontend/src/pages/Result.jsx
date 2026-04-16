import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getResult } from "@/services/quizService";
import { scoreColor, calcScore } from "@/utils/helpers";

export default function Result() {
  const { id } = useParams();
  const { data: result, isLoading } = useQuery(["result", id], () =>
    getResult(id).then((r) => r.data.result)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-forge-bg">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <p className="font-mono text-forge-muted text-sm animate-pulse">Calculating results…</p>
        </div>
      </div>
    );
  }

  const score = calcScore(result?.correct, result?.total);

  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-md mx-auto px-6 py-16 text-center animate-fade-up">
        <div className="mb-8">
          <div className={`font-display font-bold text-7xl mb-2 ${scoreColor(score)}`}>
            {score}%
          </div>
          <p className="text-forge-muted text-sm font-mono">
            {result?.correct} / {result?.total} correct
          </p>
        </div>

        <div className="card mb-6 grid grid-cols-3 gap-4 text-left">
          <StatCell label="Correct" value={result?.correct} color="text-forge-green" />
          <StatCell label="Wrong" value={result?.total - result?.correct} color="text-forge-red" />
          <StatCell label="Time" value={`${result?.timeTaken}s`} color="text-forge-text" />
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
