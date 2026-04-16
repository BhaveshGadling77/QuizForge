import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getQuizById } from "@/services/quizService";
import { formatDate } from "@/utils/helpers";
import { getQuizData } from "@/services/quizService";

export default function QuizDetails() {
  const { id } = useParams();
  const { data: quiz, isLoading, isError } = useQuery(["quiz", id], () =>
    getQuizData(id).then((r) => r.data.quiz)
  );
  if (isLoading) return <LoadingState />;
  if (isError || !quiz) return <ErrorState />;
  console.log("Quiz details fetched:", quiz); // Debug log

  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-2xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-forge-muted hover:text-forge-text text-sm mb-6 inline-block">
          ← Back to quizzes
        </Link>

        <div className="card mb-6">
          <h1 className="font-display font-bold text-2xl text-forge-text mb-2">
            {quiz.title}
          </h1>
          <p className="text-forge-muted text-sm leading-relaxed mb-5">
            {quiz.description}
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-forge-border pt-4">
            <Stat label="Questions" value={quiz.totalQuestions} />
            <Stat label="Duration" value={`${quiz.duration / 60} min`} />
            <Stat label="Created" value={formatDate(quiz.createdAt)} />
          </div>
        </div>

        <Link 
        to={`/quiz/${id}/attempt`} 
        state={{ quiz }}
        className="btn-primary block text-center w-full">
          Start Quiz →
        </Link>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="font-mono text-forge-text font-medium">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-forge-bg">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="card h-48 animate-pulse" />
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-forge-bg">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-forge-red font-mono text-sm">Failed to load quiz.</p>
      </div>
    </div>
  );
}