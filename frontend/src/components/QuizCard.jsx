import { Link } from "react-router-dom";
import { truncate, formatDate } from "@/utils/helpers";
import { QUIZ_STATUS } from "@/utils/constants";

const statusStyles = {
  [QUIZ_STATUS.PUBLISHED]: "bg-forge-green/10 text-forge-green",
  [QUIZ_STATUS.DRAFT]: "bg-forge-yellow/10 text-forge-yellow",
  [QUIZ_STATUS.CLOSED]: "bg-forge-red/10 text-forge-red",
};

export default function QuizCard({ quiz }) {
  const { quizId, title, description, isActive, totalQuestions, duration, createdAt } = quiz;

  return (
    <Link to={`/quiz/${quizId}`}>
      <div className="card hover:border-forge-accent/50 hover:-translate-y-0.5 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display font-semibold text-forge-text text-base group-hover:text-forge-accent transition-colors leading-snug">
            {truncate(title, 50)}
          </h3>
          <span className={`badge ml-2 shrink-0 ${statusStyles[isActive ? QUIZ_STATUS.PUBLISHED : QUIZ_STATUS.DRAFT] ?? ""}`}>
            {isActive ? "Published" : "Draft"}
          </span>
        </div>

        {/* Description */}
        <p className="text-forge-muted text-sm mb-4 leading-relaxed">
          {truncate(description, 90)}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs font-mono text-forge-muted border-t border-forge-border pt-3 mt-auto">
          <span>{totalQuestions ?? 0} questions</span>
          <span>{duration ?? "—"} min</span>
          <span className="ml-auto">{formatDate(createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}