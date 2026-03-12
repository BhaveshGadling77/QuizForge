import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { getQuestions, submitAttempt } from "@/services/quizService";
import { getQuizById } from "@/services/quizService";
import QuestionCard from "@/components/QuestionCard";
import Navbar from "@/components/Navbar";
import { formatTime } from "@/utils/helpers";

export default function AttemptQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: quiz } = useQuery(["quiz", id], () =>
    getQuizById(id).then((r) => r.data.quiz)
  );
  const { data: questions = [], isLoading } = useQuery(["questions", id], () =>
    getQuestions(id).then((r) => r.data.questions)
  );

  // Set timer once quiz is loaded
  useEffect(() => {
    if (quiz?.duration) setTimeLeft(quiz.duration * 60);
  }, [quiz]);

  // Countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0) handleSubmit();
  }, [timeLeft]);

  const handleAnswer = useCallback((questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitAttempt(id, answers);
      navigate(`/result/${id}`);
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitting(false);
    }
  };

  const answered = Object.keys(answers).length;
  const total = questions.length;

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />

      {/* Sticky progress bar */}
      <div className="sticky top-14 z-40 bg-forge-bg/90 backdrop-blur border-b border-forge-border">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="font-mono text-xs text-forge-muted">
            {answered}/{total} answered
          </span>
          {timeLeft !== null && (
            <span className={`font-mono text-sm font-medium ${timeLeft < 60 ? "text-forge-red animate-pulse" : "text-forge-text"}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>
        {/* Progress fill */}
        <div className="h-0.5 bg-forge-border">
          <div
            className="h-full bg-forge-accent transition-all duration-500"
            style={{ width: total ? `${(answered / total) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse" />
          ))
        ) : (
          questions.map((q, i) => (
            <QuestionCard
              key={q._id}
              question={q}
              index={i}
              selected={answers[q._id] ?? null}
              onChange={handleAnswer}
            />
          ))
        )}

        {!isLoading && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary mt-4 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : `Submit Quiz (${answered}/${total})`}
          </button>
        )}
      </main>
    </div>
  );
}