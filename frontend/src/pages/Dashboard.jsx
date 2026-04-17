import { useQuery } from "react-query";
import QuizCard from "@/components/QuizCard";
import { QUIZ_STATUS } from "@/utils/constants";
import { getActiveQuizzes } from "../services/quizService";

export default function Dashboard() {
  const { data = [], isLoading, isError } = useQuery("quizzes", () =>
    getActiveQuizzes().then((r) => r.data.quizzes)
  );
  // console.log("Fetched quizzes:", data); // Debug log
  const published = data;
  
  // console.log("Published quizzes:", published); // Debug log
  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-forge-text">
            Available Quizzes
          </h1>
          <p className="text-forge-muted text-sm mt-1">
            {published.length} quiz{published.length !== 1 ? "zes" : ""} available
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-36 animate-pulse bg-forge-surface" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-forge-red font-mono text-sm">Failed to load quizzes.</p>
        ) : published.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-forge-muted text-sm">No quizzes available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {published.map((quiz) => {
              // console.log("Rendering quiz:", quiz); // Debug log
              return <QuizCard key={quiz.quizId} quiz={quiz} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}