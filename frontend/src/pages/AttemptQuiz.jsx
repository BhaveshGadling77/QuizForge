import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  submitAttempt,
  autoSaveQuizAnswers,
  getDraftAnswers,
} from "@/services/quizService";
import QuestionCard from "@/components/QuestionCard";
import { formatTime } from "@/utils/helpers";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function AttemptQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const quiz =
    location.state?.quiz ||
    JSON.parse(localStorage.getItem(`activeQuiz_${id}`));

  const questions = quiz?.questions || [];

  const [isLoading, setIsLoading] = useState(!quiz);
  const [autoSaveFailed, setAutoSaveFailed] = useState(false);
  const autoSaveTimeoutRef = useRef(null);

  const [answers, setAnswers] = useState(() => {
    return JSON.parse(localStorage.getItem(`quizAnswers_${id}`)) || {};
  });

  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timerRestored, setTimerRestored] = useState(false);

  // Load draft answers and timer state on component mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await getDraftAnswers(id);

        if (draft?.data) {
          // Restore saved answers
          setAnswers(draft.data.answers || {});
          localStorage.setItem(
            `quizAnswers_${id}`,
            JSON.stringify(draft.data.answers || {}),
          );

          // Restore timer state
          if (draft.data.timeLeftSeconds) {
            setTimeLeft(draft.data.timeLeftSeconds);
            setTimerRestored(true);
            toast.success("Quiz resumed from where you left off");
          }
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
        // Use local storage if draft fetch fails
        const savedAnswers = JSON.parse(
          localStorage.getItem(`quizAnswers_${id}`),
        );
        if (savedAnswers) {
          setAnswers(savedAnswers);
        }
      }
    };

    if (quiz && !timerRestored) {
      loadDraft();
    }
  }, [id, quiz, timerRestored]);

  // Persist quiz
  useEffect(() => {
    if (location.state?.quiz) {
      localStorage.setItem(
        `activeQuiz_${id}`,
        JSON.stringify(location.state.quiz),
      );
      setIsLoading(false);
    }
  }, [location.state, id]);

  //  Persist answers to local storage
  useEffect(() => {
    localStorage.setItem(`quizAnswers_${id}`, JSON.stringify(answers));
  }, [answers, id]);

  // Auto-save answers to backend every 3 seconds
  useEffect(() => {
    if (!quiz || !id || Object.keys(answers).length === 0) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const formattedAnswers = Object.entries(answers).map(
          ([questionId, value]) => {
            if (typeof value === "number") {
              return {
                questionId,
                selectedOptionIndex: value,
              };
            }
            return {
              questionId,
              submittedAnswer: value,
            };
          },
        );

        await autoSaveQuizAnswers(id, {
          answers: formattedAnswers,
          timeLeftSeconds: timeLeft || 0,
        });

        setAutoSaveFailed(false);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setAutoSaveFailed(true);
        // Don't show error toast every time, just set state
      }
    }, 3000); // Auto-save every 3 seconds

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [answers, timeLeft, quiz, id]);

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
    if (quiz?.duration && timeLeft === null && !timerRestored) {
      setTimeLeft(quiz.duration);
    }
  }, [quiz, timeLeft, timerRestored]);

  //  Timer tick
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const t = setTimeout(() => {
      setTimeLeft((s) => Math.max(s - 1, 0));
    }, 1000);

    return () => clearTimeout(t);
  }, [timeLeft]);

  //  Auto-submit when time ends
  useEffect(() => {
    if (timeLeft === 0 && !submitting) {
      handleSubmit();
    }
  }, [timeLeft]); // eslint-disable-line

  // Tab switch detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        console.warn("User switched tab!");
        toast.error("Tab switch detected. Please stay focused on the quiz.");
        // You can implement stricter penalties here if needed
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
        ([questionId, value]) => {
          if (typeof value === "number") {
            return {
              questionId,
              selectedOptionIndex: value,
            };
          }

          return {
            questionId,
            submittedAnswer: value,
          };
        },
      );

      const timeTaken =
        quiz?.duration && timeLeft !== null ? quiz.duration - timeLeft : 0;

      const payload = {
        quizId: id,
        userId: user._id,
        userName: user.name,
        email: user.email,
        answers: formattedAnswers,
        timeTakenSeconds: Math.max(timeTaken, 0),
      };

      const res = await submitAttempt(id, payload);
      // Clean up after successful submission
      localStorage.removeItem(`activeQuiz_${id}`);
      localStorage.removeItem(`quizAnswers_${id}`);
      toast.success("Quiz submitted successfully!");
      navigate(`/result/${res.data.resultId}`);
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Failed to submit quiz. Please try again.");
      setSubmitting(false);
    }
  };

  const answered = questions.filter((q) => {
    const qid = q.id || q.questionId;
    const val = answers[qid];
    return val !== null && val !== undefined && val !== "";
  }).length;

  const total = questions.length;

  if (!quiz && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Quiz not found or expired.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Sticky header bar */}
      <div className="sticky top-14 z-40 bg-forge-bg/90 backdrop-blur border-b border-forge-border">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-forge-muted">
              {answered}
              <span className="text-forge-border mx-1">/</span>
              {total}
              <span className="ml-1 text-forge-muted/60">answered</span>
            </span>

            {autoSaveFailed && (
              <span className="text-xs text-orange-400 font-mono">
                Auto-save failed
              </span>
            )}
          </div>

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

        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="card h-40 animate-pulse" />
            ))
          : questions.map((q, i) => {
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
            })}

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
