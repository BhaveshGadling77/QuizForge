import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getAllResults } from "@/services/quizService";
import Navbar from "@/components/Navbar";
import { scoreColor, formatDate } from "@/utils/helpers";

export default function ViewResults() {
  const { id } = useParams();
  const { data, isLoading } = useQuery(["admin-results", id], () =>
    getAllResults(id).then((r) => r.data)
  );

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/admin" className="text-forge-muted hover:text-forge-text text-sm mb-6 inline-block">
          ← Dashboard
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-2xl text-forge-text">
            Results — {data?.quizTitle ?? "…"}
          </h1>
          <span className="badge bg-forge-border text-forge-muted font-mono">
            {data?.results?.length ?? 0} submissions
          </span>
        </div>

        {isLoading ? (
          <div className="card h-64 animate-pulse" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-forge-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forge-border bg-forge-surface">
                  {["Student", "Score", "Correct", "Time Taken", "Submitted"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-xs text-forge-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.results?.map((r) => (
                  <tr key={r._id} className="border-b border-forge-border last:border-0 hover:bg-forge-surface/60 transition-colors">
                    <td className="px-4 py-3 text-forge-text font-medium">{r.student?.name}</td>
                    <td className={`px-4 py-3 font-mono font-medium ${scoreColor(r.score)}`}>{r.score}%</td>
                    <td className="px-4 py-3 font-mono text-forge-muted">{r.correct}/{r.total}</td>
                    <td className="px-4 py-3 font-mono text-forge-muted">{r.timeTaken}s</td>
                    <td className="px-4 py-3 font-mono text-forge-muted text-xs">{formatDate(r.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}