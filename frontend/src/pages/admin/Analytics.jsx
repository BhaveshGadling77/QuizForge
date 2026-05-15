import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getDashboardStats,
  getAllQuizzesAnalytics,
} from "@/services/userService";
import toast from "react-hot-toast";
import { BarChart3, Users, BookOpen, TrendingUp } from "lucide-react";

function StatCard({ label, value, icon: Icon, color = "forge-accent" }) {
  return (
    <div className="bg-forge-surface rounded-xl border border-forge-border p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-forge-muted text-sm">{label}</p>
          <p className="text-3xl font-bold text-forge-text mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}/10 text-${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function QuizAnalyticsCard({ quiz }) {
  return (
    <div className="bg-forge-surface rounded-xl border border-forge-border p-5 hover:border-forge-accent/50 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-forge-text">{quiz.title}</h3>
          <p className="text-sm text-forge-muted mt-1">{quiz.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-xs text-forge-muted">Total Attempts</p>
          <p className="text-xl font-bold text-forge-text">
            {quiz.totalAttempts}
          </p>
        </div>
        <div>
          <p className="text-xs text-forge-muted">Average Score</p>
          <p className="text-xl font-bold text-forge-text">
            {quiz.averageScore.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-forge-muted">Highest Score</p>
          <p className="text-xl font-bold text-forge-text">
            {quiz.highestScore}%
          </p>
        </div>
        <div>
          <p className="text-xs text-forge-muted">Pass Rate</p>
          <p className="text-xl font-bold text-forge-text">
            {quiz.passRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Score Distribution */}
      {Object.keys(quiz.scoreDistribution).length > 0 && (
        <div className="mt-4 pt-4 border-t border-forge-border/30">
          <p className="text-xs text-forge-muted mb-3">Score Distribution</p>
          <div className="space-y-2">
            {Object.entries(quiz.scoreDistribution).map(([range, count]) => (
              <div key={range} className="flex items-center gap-2">
                <span className="text-xs text-forge-muted w-12">{range}</span>
                <div className="flex-1 h-2 bg-forge-border/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-forge-accent to-forge-accent/60"
                    style={{
                      width: `${Math.max((count / quiz.totalAttempts) * 100, 5)}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-forge-text w-6 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [quizAnalytics, setQuizAnalytics] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [dashRes, analyticsRes] = await Promise.all([
        getDashboardStats(),
        getAllQuizzesAnalytics(),
      ]);

      setStats(dashRes.data.stats);
      setQuizAnalytics(analyticsRes.data.analytics);
    } catch (error) {
      toast.error("Failed to load analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-forge-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-forge-text">
            Analytics Dashboard
          </h1>
          <p className="text-forge-muted text-sm mt-2">
            Comprehensive overview of your quizzes and student performance
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Quizzes"
              value={stats.totalQuizzes}
              icon={BookOpen}
            />
            <StatCard
              label="Total Students"
              value={stats.totalStudents}
              icon={Users}
            />
            <StatCard
              label="Total Attempts"
              value={stats.totalAttempts}
              icon={BarChart3}
            />
            <StatCard
              label="Average Score"
              value={`${stats.averageScore.toFixed(1)}%`}
              icon={TrendingUp}
            />
          </div>
        )}

        {/* Quizzes Analytics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-forge-text">
              Quiz Performance
            </h2>
            <span className="text-sm text-forge-muted">
              {quizAnalytics.length} quizzes
            </span>
          </div>

          {quizAnalytics.length === 0 ? (
            <div className="bg-forge-surface rounded-xl border border-forge-border p-12 text-center">
              <p className="text-forge-muted">
                No quizzes created yet. Start by creating your first quiz!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {quizAnalytics.map((quiz) => (
                <QuizAnalyticsCard key={quiz.quizId} quiz={quiz} />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-forge-surface rounded-xl border border-forge-border p-6">
          <h3 className="font-bold text-lg text-forge-text mb-3">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-forge-muted mb-2">Key Metrics</p>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm">
                  <span className="text-forge-muted">Total Assessments:</span>
                  <span className="font-medium text-forge-text">
                    {stats?.totalAttempts || 0}
                  </span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-forge-muted">Active Quizzes:</span>
                  <span className="font-medium text-forge-text">
                    {quizAnalytics.filter((q) => q.totalAttempts > 0).length}
                  </span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-forge-muted">Overall Average:</span>
                  <span className="font-medium text-forge-text">
                    {stats?.averageScore.toFixed(1) || 0}%
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm text-forge-muted mb-2">Insights</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-forge-accent mt-0.5">→</span>
                  <span className="text-forge-muted">
                    {quizAnalytics.length > 0
                      ? `Your most attempted quiz has ${Math.max(...quizAnalytics.map((q) => q.totalAttempts))} attempts`
                      : "Create your first quiz to get started"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forge-accent mt-0.5">→</span>
                  <span className="text-forge-muted">
                    Student engagement is{" "}
                    {stats && stats.totalAttempts > 100
                      ? "very high"
                      : stats && stats.totalAttempts > 50
                        ? "moderate"
                        : "just starting"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
