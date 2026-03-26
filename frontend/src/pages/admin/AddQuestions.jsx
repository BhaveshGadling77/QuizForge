import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import {
  getQuestions,
  addQuestion,
  deleteQuestion,
} from "@/services/quizService";
import Navbar from "@/components/Navbar";

// remove undefined if any
const cleanData = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );

const emptyForm = () => ({
  questionMd: "",
  questionType: "mcq",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  correctAnswer: null,
  points: 10,
});

export default function AddQuestions() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data: questions = [], isLoading } = useQuery(
    ["questions", id],
    () => getQuestions(id).then((r) => r.data.questions)
  );

  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  const handleTypeChange = (type) => {
    if (type === "true-false") {
      setForm({
        ...form,
        questionType: type,
        options: ["True", "False"],
        correctOptionIndex: 0,
        correctAnswer: null,
      });
    } else if (type === "mcq") {
      setForm({
        ...form,
        questionType: type,
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        correctAnswer: null,
      });
    } else {
      // short answer types
      setForm({
        ...form,
        questionType: type,
        options: null,
        correctOptionIndex: null,
        correctAnswer: "",
      });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let payload = {
        ...form,
        order: questions.length + 1,
        createdAt: new Date().toISOString(),
      };

      if (
        form.questionType === "short-integer" ||
        form.questionType === "short-subjective"
      ) {
        payload.options = null;
        payload.correctOptionIndex = null;
      }

      payload = cleanData(payload);

      // console.log("FINAL PAYLOAD:", payload); // debug

      await addQuestion(id, payload);

      qc.invalidateQueries(["questions", id]);
      setForm(emptyForm());
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ?? "Failed to add question"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qid) => {
    await deleteQuestion(id, qid);
    qc.invalidateQueries(["questions", id]);
  };

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl mb-6">Add Questions</h1>

        {/* FORM */}
        <form onSubmit={handleAdd} className="card flex flex-col gap-5 mb-8">
          {/* QUESTION */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Question
            </label>
            <textarea
              className="input"
              placeholder="Enter your question..."
              value={form.questionMd}
              onChange={(e) =>
                setForm({ ...form, questionMd: e.target.value })
              }
              required
            />
          </div>

          {/* TYPE */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Question Type
            </label>
            <select
              className="input"
              value={form.questionType}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="true-false">True / False</option>
              <option value="short-integer">Short Integer</option>
              <option value="short-subjective">Subjective</option>
            </select>
          </div>

          {/* OPTIONS */}
          {(form.questionType === "mcq" ||
            form.questionType === "true-false") && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Options
              </label>

              <div className="flex flex-col gap-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={form.correctOptionIndex === i}
                      onChange={() =>
                        setForm({ ...form, correctOptionIndex: i })
                      }
                    />

                    <input
                      className="input flex-1"
                      value={opt}
                      onChange={(e) =>
                        setOption(i, e.target.value)
                      }
                      placeholder={`Option ${i + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-1">
                Select the correct answer using the radio button
              </p>
            </div>
          )}

          {/* SHORT ANSWER */}
          {(form.questionType === "short-integer" ||
            form.questionType === "short-subjective") && (
            <div>
              <label className="text-sm font-medium mb-1 block">
                Correct Answer
              </label>
              <input
                className="input"
                placeholder="Enter correct answer..."
                value={form.correctAnswer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    correctAnswer: e.target.value,
                  })
                }
              />
            </div>
          )}

          {/* POINTS */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Points
            </label>
            <input
              type="number"
              className="input"
              value={form.points}
              min={1}
              onChange={(e) =>
                setForm({ ...form, points: +e.target.value })
              }
            />
          </div>

          {/* ERROR */}
          {error && <p className="text-red-500 text-xs">{error}</p>}

          {/* SUBMIT */}
          <button className="btn-primary" disabled={saving}>
            {saving ? "Adding..." : "Add Question"}
          </button>
        </form>

        {/* LIST */}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          questions.map((q, i) => (
            <div key={q.questionId} className="card mb-2 flex justify-between">
              <div>
                <p>Q{i + 1}</p>
                <p>{q.questionMd}</p>
              </div>
              <button onClick={() => handleDelete(q.questionId)}>
                Delete
              </button>
            </div>
          ))
        )}

        <Link to="/admin" className="btn-primary mt-4 block text-center">
          Done
        </Link>
      </main>
    </div>
  );
}