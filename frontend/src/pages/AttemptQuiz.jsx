import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { submitAttempt } from "@/services/quizService";
import QuestionCard from "@/components/QuestionCard";
import Navbar from "@/components/Navbar";
import { formatTime } from "@/utils/helpers";
import { useAuth } from "@/hooks/useAuth";

export default function AttemptQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // console.log("User in AttemptQuiz:", user);
  const quiz = 
    location.state?.quiz ||
    JSON.parse(localStorage.getItem(`activeQuiz_${id}`));

  const questions = quiz?.questions || [];

  const [isLoading, setIsLoading] = useState(!quiz);

  const [answers, setAnswers] = useState(() => {
    return JSON.parse(localStorage.getItem(`quizAnswers_${id}`)) || {};
  });

  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Persist quiz
  useEffect(() => {
    if (location.state?.quiz) {
      localStorage.setItem(
        `activeQuiz_${id}`,
        JSON.stringify(location.state.quiz)
      );
      setIsLoading(false);
    }
  }, [location.state, id]);

  //  Persist answers
  useEffect(() => {
    localStorage.setItem(`quizAnswers_${id}`, JSON.stringify(answers));
  }, [answers, id]);

  //  Warn before leaving
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "You have unsaved answers!";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  //  Timer init
  useEffect(() => {
    if (quiz?.duration && timeLeft === null) {
      setTimeLeft(quiz.duration);
    }
  }, [quiz, timeLeft]);

  //  Timer tick
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const t = setTimeout(() => {
      setTimeLeft((s) => Math.max(s - 1, 0));
    }, 1000);

    return () => clearTimeout(t);
  }, [timeLeft]);

  //  Auto-submit
  useEffect(() => {
    if (timeLeft === 0 && !submitting) {
      handleSubmit();
    }
  }, [timeLeft]); // eslint-disable-line

  // Optional anti-cheat (tab switch)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        console.warn("User switched tab!");
        // You can track this if needed
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, value]) => ({
          questionId,
          answer:
            typeof value === "number"
              ? { type: "mcq", value }
              : { type: "subjective", value },
        })
      );

      const timeTaken =
        quiz?.duration && timeLeft !== null
          ? quiz.duration - timeLeft
          : 0;

      const payload = {
        quizId: id,

        // ✅ USER DATA (IMPORTANT)
        userId: user._id,
        userName: user.name,
        email: user.email,

        answers: formattedAnswers,
        timeTakenSeconds: Math.max(timeTaken, 0),

        attemptNumber: 1, // you can later increment from backend
      };

      await submitAttempt(id, payload);

      localStorage.removeItem(`activeQuiz_${id}`);
      localStorage.removeItem(`quizAnswers_${id}`);

      navigate(`/result/${id}`);
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitting(false);
    }
  };
  const answered = questions.filter((q) => {
    const qid = q.id || q.questionId;
    const val = answers[qid];
    return val !== null && val !== undefined && val !== "";
  }).length;

  const total = questions.length;

  // 🚨 If quiz missing
  if (!quiz && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Quiz not found or expired.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />

      {/* Sticky bar */}
      <div className="sticky top-14 z-40 bg-forge-bg/90 backdrop-blur border-b border-forge-border">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="font-mono text-xs text-forge-muted">
            {answered}
            <span className="text-forge-border mx-1">/</span>
            {total}
            <span className="ml-1 text-forge-muted/60">answered</span>
          </span>

          {timeLeft !== null && (
            <span
              className={`font-mono text-sm font-medium tabular-nums ${
                timeLeft < 60
                  ? "text-rose-400 animate-pulse"
                  : timeLeft < 300
                  ? "text-amber-400"
                  : "text-forge-text"
              }`}
            >
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <div className="h-0.5 bg-forge-border">
          <div
            className="h-full bg-forge-accent transition-all duration-500"
            style={{ width: total ? `${(answered / total) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">
        {quiz?.title && !isLoading && (
          <div className="mb-2">
            <h1 className="font-display text-xl font-bold text-forge-text">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-sm text-forge-muted mt-1">
                {quiz.description}
              </p>
            )}
          </div>
        )}

        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse" />
          ))
        ) : (
          questions.map((q, i) => {
            const qid = q.id || q.questionId;
            return (
              <QuestionCard
                key={qid || i}
                question={q}
                index={i}
                selected={answers[qid] ?? null}
                onChange={handleAnswer}
              />
            );
          })
        )}

        {!isLoading && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary mt-4 disabled:opacity-50"
          >
            {submitting
              ? "Submitting…"
              : `Submit Quiz (${answered}/${total})`}
          </button>
        )}
      </main>
    </div>
  );
}