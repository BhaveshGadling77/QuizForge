import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import { getStudentResult, evaluateResult, getQuestions } from "@/services/quizService";
import toast from "react-hot-toast";

export default function EvaluateResult() {
  const { id, userId } = useParams(); // id is quizId
  const navigate = useNavigate();

  const { data: resultData, isLoading: isResultLoading } = useQuery(["student-result", id, userId], () =>
    getStudentResult(id, userId).then((r) => r.data.data)
  );

  const { data: questionsData, isLoading: isQuestionsLoading } = useQuery(["quiz-questions", id], () =>
    getQuestions(id).then((r) => r.data.data)
  );

  const questionsMap = useMemo(() => {
    if (!questionsData) return {};
    return questionsData.reduce((acc, q) => {
      acc[q.questionId] = q;
      return acc;
    }, {});
  }, [questionsData]);

  const [scores, setScores] = useState({});

  const mutation = useMutation(
    (payload) => evaluateResult(resultData.resultId, payload),
    {
      onSuccess: () => {
        toast.success("Result evaluated successfully!");
        navigate(`/admin/quiz/${id}/results`);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to evaluate");
      }
    }
  );

  if (isResultLoading || isQuestionsLoading) {
    return <div className="p-10 text-center animate-pulse text-forge-muted">Loading...</div>;
  }

  if (!resultData) {
    return <div className="p-10 text-center text-forge-muted">Result not found</div>;
  }

  const handleScoreChange = (qId, val, maxPoints) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > maxPoints) num = maxPoints;

    setScores(prev => ({
      ...prev,
      [qId]: num
    }));
  };

  const handleSave = () => {
    const scoresArray = Object.keys(scores).map(qId => ({
      questionId: qId,
      pointsEarned: scores[qId]
    }));
    mutation.mutate(scoresArray);
  };

  return (
    <div className="min-h-screen bg-forge-bg">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to={`/admin/quiz/${id}/results`} className="text-forge-muted hover:text-forge-text text-sm mb-6 inline-block">
          ← Back to Results
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-forge-text mb-1">
              Evaluate Submission
            </h1>
            <p className="text-sm text-forge-muted font-mono">
              Student: {resultData.userName || resultData.userId}
            </p>
          </div>
          {resultData.evaluationStatus !== 'evaluated' ? (
            <button 
              onClick={handleSave} 
              disabled={mutation.isLoading}
              className="btn-primary"
            >
              {mutation.isLoading ? "Saving..." : "Save Evaluation"}
            </button>
          ) : (
            <span className="badge bg-forge-green/10 text-forge-green border border-forge-green/20">
              Evaluated
            </span>
          )}
        </div>

        <div className="grid gap-6">
          {resultData.answers?.map((ans, idx) => {
            const questionData = ans.questionSnapshot || questionsMap[ans.questionId] || {};
            const isSubjective = questionData.questionType === 'short-subjective';
            const isInteger = questionData.questionType === 'short-integer';
            
            // Only short subjective needs manual grading options as requested
            const needsGrading = isSubjective;
            const maxPoints = questionData.points || ans.maxPoints;

            let studentAnswer = null;
            if (ans.submittedAnswer !== null && ans.submittedAnswer !== undefined && String(ans.submittedAnswer).trim() !== "") {
              studentAnswer = String(ans.submittedAnswer);
            } else if (ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined) {
              studentAnswer = questionData.options?.[ans.selectedOptionIndex] || `Option ${ans.selectedOptionIndex + 1}`;
            }

            return (
              <div key={ans.questionId} className="card flex flex-col gap-4 border border-forge-border bg-forge-surface/30">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-medium text-forge-text text-sm">
                    <span className="text-forge-muted mr-2">{idx + 1}.</span>
                    {questionData.questionMd || 'Question Text'}
                  </h3>
                  <span className="badge bg-forge-bg text-forge-muted text-[10px] whitespace-nowrap">
                    {questionData.questionType || 'Unknown'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-forge-muted uppercase tracking-wider">Student Answer</p>
                    <div className="px-3 py-2.5 bg-forge-bg rounded-lg border border-forge-border/50 text-forge-text text-sm break-words min-h-[44px]">
                      {studentAnswer !== null ? studentAnswer : <span className="text-forge-muted italic">No Answer</span>}
                    </div>
                  </div>

                  {(questionData.questionType === 'mcq' || questionData.questionType === 'true-false' || isInteger) && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-forge-muted uppercase tracking-wider">Correct Answer</p>
                      <div className="px-3 py-2.5 bg-forge-bg rounded-lg border border-forge-border/50 text-forge-text text-sm min-h-[44px]">
                        {questionData.questionType === 'mcq' || questionData.questionType === 'true-false' 
                          ? questionData.options?.[questionData.correctOptionIndex] 
                          : questionData.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-forge-border/40 pt-4 mt-2">
                  <div className="text-sm">
                    Status: <span className={`font-semibold ${ans.isCorrect === true ? "text-forge-green" : ans.isCorrect === false ? "text-forge-red" : "text-forge-yellow"}`}>
                      {ans.isCorrect === true ? "Correct" : ans.isCorrect === false ? "Incorrect" : "Pending"}
                    </span>
                  </div>
                  
                  {needsGrading && resultData.evaluationStatus !== 'evaluated' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-forge-muted">Points ({maxPoints} max):</span>
                      <input 
                        type="number" 
                        min="0" 
                        max={maxPoints}
                        className="input-field w-24 text-center py-1.5 px-2 bg-forge-bg"
                        value={scores[ans.questionId] !== undefined ? scores[ans.questionId] : (ans.pointsEarned || 0)}
                        onChange={(e) => handleScoreChange(ans.questionId, e.target.value, maxPoints)}
                      />
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-forge-text">
                      Score: {ans.pointsEarned} <span className="text-forge-muted font-normal">/ {maxPoints}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
