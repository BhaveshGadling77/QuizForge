import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getLeaderboard } from "@/services/quizService";
import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/LeaderboardTable";
import { useAuth } from "@/hooks/useAuth";

export default function Leaderboard() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading } = useQuery(["leaderboard", id], () =>
    getLeaderboard(id).then((r) => r.data)
  );

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-forge-text">
              Leaderboard
            </h1>
            <p className="text-forge-muted text-sm mt-1">{data?.quizTitle}</p>
          </div>
          <Link to="/dashboard" className="btn-ghost text-sm">
            ← Quizzes
          </Link>
        </div>

        {isLoading ? (
          <div className="card h-64 animate-pulse" />
        ) : (
          <LeaderboardTable
            entries={data?.entries ?? []}
            currentUserId={user?._id}
          />
        )}
      </main>
    </div>
  );
}