import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { getQuizData } from "@/services/quizService";
import { formatDate } from "@/utils/helpers";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function QuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);

  const { data: quiz, isLoading, isError, error } = useQuery(["quiz", id], () =>
    getQuizData(id).then((r) => r.data.quiz)
  );

  if (isLoading) return <LoadingState />;
  if (isError || !quiz) return <ErrorState error={error} />;
  // console.log("Quiz details fetched:", quiz); // Debug log

  const handleStartPrivate = async () => {
    if (!token.trim()) {
      toast.error("Please enter an access token");
      return;
    }
    setVerifying(true);
    try {
      const response = await api.post(`/quizzes/${id}/start`, { accessToken: token });
      if (response.data.success) {
        toast.success("Access granted!");
        navigate(`/quiz/${id}/attempt`, { state: { quiz: response.data.quiz } });
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invalid access token");
    } finally {
      setVerifying(false);
    }
  };

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
            <Stat label="Created" value={formatDate(quiz.createdAt?.seconds ? quiz.createdAt.seconds * 1000 : quiz.createdAt)} />
          </div>
        </div>

        {quiz.alreadyAttempted ? (
          <div className="card p-6 border-forge-accent/20 text-center">
            <h3 className="text-forge-text font-bold mb-2">Quiz Already Attempted</h3>
            <p className="text-sm text-forge-muted mb-4">You have already completed this quiz.</p>
            <Link 
              to={`/result/${id}`} 
              className="btn-primary block text-center w-full">
              View Your Result →
            </Link>
          </div>
        ) : quiz.visibility === "private" ? (
          <div className="card p-6 border-forge-accent/20">
            <h3 className="text-forge-text font-bold mb-2">Private Quiz</h3>
            <p className="text-sm text-forge-muted mb-4">An access token is required to take this quiz.</p>
            <div className="flex gap-3">
              <input 
                type="text" 
                className="input-field flex-1" 
                placeholder="Enter Access Token" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button 
                className="btn-primary shrink-0" 
                onClick={handleStartPrivate}
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Start Quiz →"}
              </button>
            </div>
          </div>
        ) : (
          <Link 
            to={`/quiz/${id}/attempt`} 
            state={{ quiz }}
            className="btn-primary block text-center w-full">
            Start Quiz →
          </Link>
        )}
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

function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-forge-bg">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-forge-red font-mono text-sm">Failed to load quiz. {error?.response?.data?.msg || error?.message}</p>
      </div>
    </div>
  );
}