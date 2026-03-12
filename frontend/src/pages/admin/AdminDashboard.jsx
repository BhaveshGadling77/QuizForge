import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { getQuizzes } from "@/services/quizService";
import Navbar from "@/components/Navbar";
import { QUIZ_STATUS } from "@/utils/constants";
import { formatDate, truncate } from "@/utils/helpers";

const statusStyles = {
  [QUIZ_STATUS.PUBLISHED]: "bg-forge-green/10 text-forge-green",
  [QUIZ_STATUS.DRAFT]: "bg-forge-yellow/10 text-forge-yellow",
  [QUIZ_STATUS.CLOSED]: "bg-forge-red/10 text-forge-red",
};

export default function AdminDashboard() {
  const { data: quizzes = [], isLoading } = useQuery("admin-quizzes", () =>
    getQuizzes().then((r) => r.data.quizzes)
  );

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-forge-text">Admin Dashboard</h1>
            <p className="text-forge-muted text-sm mt-1">{quizzes.length} total quiz{quizzes.length !== 1 ? "zes" : ""}</p>
          </div>
          <Link to="/admin/create" className="btn-primary">+ Create Quiz</Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Published", val: quizzes.filter((q) => q.status === QUIZ_STATUS.PUBLISHED).length, color: "text-forge-green" },
            { label: "Drafts", val: quizzes.filter((q) => q.status === QUIZ_STATUS.DRAFT).length, color: "text-forge-yellow" },
            { label: "Closed", val: quizzes.filter((q) => q.status === QUIZ_STATUS.CLOSED).length, color: "text-forge-red" },
          ].map(({ label, val, color }) => (
            <div key={label} className="card">
              <p className="label">{label}</p>
              <p className={`font-display font-bold text-3xl ${color}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Quiz table */}
        {isLoading ? (
          <div className="card h-64 animate-pulse" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-forge-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forge-border bg-forge-surface">
                  {["Title", "Status", "Questions", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-xs text-forge-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id} className="border-b border-forge-border last:border-0 hover:bg-forge-surface/60 transition-colors">
                    <td className="px-4 py-3 text-forge-text font-medium">{truncate(quiz.title, 40)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusStyles[quiz.status]}`}>{quiz.status}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-forge-muted">{quiz.questionCount}</td>
                    <td className="px-4 py-3 font-mono text-forge-muted text-xs">{formatDate(quiz.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/admin/edit/${quiz._id}`} className="text-forge-accent hover:underline text-xs">Edit</Link>
                        <Link to={`/admin/quiz/${quiz._id}/questions`} className="text-forge-muted hover:text-forge-text text-xs">Questions</Link>
                        <Link to={`/admin/quiz/${quiz._id}/results`} className="text-forge-muted hover:text-forge-text text-xs">Results</Link>
                      </div>
                    </td>
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