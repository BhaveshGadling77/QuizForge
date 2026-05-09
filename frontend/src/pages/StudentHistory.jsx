import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
  getAttemptHistory,
  getStudentStatistics,
} from "@/services/quizService";
import { formatDate } from "@/utils/helpers";
import { BarChart3, TrendingUp, Trophy, Zap } from "lucide-react";

export default function StudentHistory() {
  const { data: stats, isLoading: statsLoading } = useQuery(
    "studentStats",
    getStudentStatistics,
  );

  const { data: history, isLoading: historyLoading } = useQuery(
    "attemptHistory",
    getAttemptHistory,
  );

  const stats_data = stats?.data || {};
  const attempts = history?.data || [];

  // Format time helper
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Get score color
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-amber-400";
    return "text-red-400";
  };

  // Stat Card Component
  function StatCard({ icon: Icon, label, value, subtext }) {
    return (
      <div className="card p-4 border-l-2 border-l-forge-accent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs text-forge-muted mb-1">{label}</p>
            <p className="text-2xl font-bold text-forge-text font-display">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-forge-muted mt-1">{subtext}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-forge-accent/10 flex items-center justify-center text-forge-accent shrink-0">
            <Icon size={20} />
          </div>
        </div>
      </div>
    );
  }

  if (statsLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-forge-bg">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-forge-surface rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display font-bold text-3xl text-forge-text mb-2">
            Your Quiz History
          </h1>
          <p className="text-forge-muted text-sm">
            Track your progress and performance across all quizzes
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={Zap}
            label="Total Attempts"
            value={stats_data.totalAttempts || 0}
            subtext={`${stats_data.totalQuizzesAttempted || 0} unique quizzes`}
          />
          <StatCard
            icon={Trophy}
            label="Highest Score"
            value={stats_data.highestScore || 0}
            subtext={`Out of ${100}`}
          />
          <StatCard
            icon={TrendingUp}
            label="Average Score"
            value={Math.round(stats_data.averageScore || 0)}
            subtext={`${Math.round(stats_data.averagePercentage || 0)}% average`}
          />
          <StatCard
            icon={BarChart3}
            label="Avg Time"
            value={formatDuration(stats_data.averageTimeSeconds || 0)}
            subtext="Per quiz"
          />
        </div>

        {/* Attempt History Table */}
        <div className="card overflow-hidden">
          <div className="border-b border-forge-border px-6 py-4">
            <h2 className="font-display font-bold text-lg text-forge-text">
              Quiz Attempts
            </h2>
          </div>

          {attempts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-forge-muted text-sm mb-4">
                No quiz attempts yet
              </p>
              <Link
                to="/dashboard"
                className="text-forge-accent text-sm hover:underline"
              >
                Start a quiz →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-forge-surface/50 border-b border-forge-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-forge-muted">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-forge-muted">
                      Score
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-forge-muted">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-forge-muted">
                      Time
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-forge-muted">
                      Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-forge-muted">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.resultId}
                      className="border-b border-forge-border/50 hover:bg-forge-surface/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-forge-text text-sm">
                            {attempt.quizTitle}
                          </p>
                          <p className="text-xs text-forge-muted mt-1">
                            Attempt #{attempt.attemptNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <p
                            className={`font-mono font-bold text-lg ${getScoreColor(
                              attempt.percentage,
                            )}`}
                          >
                            {attempt.score}/{attempt.totalPoints}
                          </p>
                          <p className="text-xs text-forge-muted">
                            {Math.round(attempt.percentage)}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            attempt.evaluationStatus === "evaluated"
                              ? "bg-forge-green/10 text-forge-green"
                              : "bg-forge-yellow/10 text-forge-yellow"
                          }`}
                        >
                          {attempt.evaluationStatus === "evaluated"
                            ? "Evaluated"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-forge-text font-mono">
                          {formatDuration(attempt.timeTakenSeconds)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-forge-muted">
                          {formatDate(
                            attempt.submittedAt?.toDate
                              ? attempt.submittedAt.toDate()
                              : new Date(attempt.submittedAt),
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/result/${attempt.quizId}`}
                          className="text-forge-accent text-sm hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="text-forge-accent text-sm hover:underline"
          >
            ← Back to Quizzes
          </Link>
        </div>
      </main>
    </div>
  );
}
