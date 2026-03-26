import { useQuery, useMutation, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import {
  getQuizzes,
  publishQuiz,
  unpublishQuiz,
  deleteQuiz,
} from "@/services/quizService";
import Navbar from "@/components/Navbar";
import { formatDate, truncate } from "@/utils/helpers";

const getStatus = (quiz) => {
  if (!quiz.isActive) return "DRAFT";
  if ((quiz.totalQuestions ?? 0) === 0) return "EMPTY";
  return "PUBLISHED";
};

const statusStyles = {
  PUBLISHED: "bg-forge-green/10 text-forge-green",
  DRAFT: "bg-forge-yellow/10 text-forge-yellow",
  EMPTY: "bg-forge-gray/10 text-forge-muted",
};

export default function AdminDashboard() {
  const qc = useQueryClient();

  // Fetch quizzes
  const { data, isLoading } = useQuery(
  "admin-quizzes",
  () => getQuizzes()
);

const handleDeleteQuiz = async (quizId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this quiz?"
  );
  if (!confirmDelete) return;

  try {
    //set query with correct quizId 
    qc.setQueryData("admin-quizzes", (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        data: {
          ...oldData.data,
          quizzes: oldData.data.quizzes.filter(
            (q) => q.quizId !== quizId 
          ),
        },
      };
    });

    await deleteQuiz(quizId);

    qc.invalidateQueries("admin-quizzes");
  } catch (err) {
    console.error("Delete failed", err);
  }
};
const quizzes = data?.data?.quizzes ?? [];
// console.log("API RESPONSE:", quizzes); //debug
  // Publish mutation
  const publishMutation = useMutation(
    (quizId) => publishQuiz(quizId),
    {
      onSuccess: () => qc.invalidateQueries("admin-quizzes"),
    }
  );

  // Unpublish mutation
  const unpublishMutation = useMutation(
    (quizId) => unpublishQuiz(quizId),
    {
      onSuccess: () => qc.invalidateQueries("admin-quizzes"),
    }
  );

  // Normalize
  const normalizedQuizzes = quizzes.map((q) => ({
    ...q,
    id: q.quizId,
    status: getStatus(q),
  }));
  
  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-forge-muted">
              {normalizedQuizzes.length} quizzes
            </p>
          </div>

          <Link to="/admin/create" className="btn-primary p-4">
            + Create Quiz
          </Link>
        </div>

        {/* TABLE */}
        {isLoading ? (
          <div className="card h-64 animate-pulse" />
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-forge-surface border-b">
                  {["Title", "Status", "Questions", "Created", "Actions"].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {normalizedQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b">
                    {/* TITLE */}
                    <td className="px-4 py-3">
                      {truncate(quiz.title, 40)}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          statusStyles[quiz.status]
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </td>

                    {/* QUESTIONS */}
                    <td className="px-4 py-3">
                      {quiz.totalQuestions ?? 0}
                    </td>

                    {/* CREATED */}
                    <td className="px-4 py-3 text-xs">
                      {formatDate(quiz.createdAt)}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3">
                      <div className="flex gap-3 items-center">
                        {/* Publish / Unpublish */}
                        {quiz.isActive ? (
                          <button
                            onClick={() =>
                              unpublishMutation.mutate(quiz.id)
                            }
                            className="text-forge-red text-xs"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              publishMutation.mutate(quiz.id)
                            }
                            className="text-forge-green text-xs"
                          >
                            Publish
                          </button>
                        )}

                      {/* Delete */} 
                      <button 
                        onClick={() => handleDeleteQuiz(quiz.id)} 
                        className="text-forge-red text-xs" > 
                        Delete 
                      </button>
                        {/* Questions */}
                        <Link
                          to={`/admin/quiz/${quiz.id}/questions`}
                          className="text-xs text-forge-muted"
                        >
                          Questions
                        </Link>

                        {/* Results */}
                        <Link
                          to={`/admin/quiz/${quiz.id}/results`}
                          className="text-xs text-forge-muted"
                        >
                          Results
                        </Link>
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