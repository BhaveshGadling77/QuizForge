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
        <form onSubmit={handleAdd} className="card flex flex-col gap-4 mb-8">
          <textarea
            className="input"
            placeholder="Question"
            value={form.questionMd}
            onChange={(e) =>
              setForm({ ...form, questionMd: e.target.value })
            }
            required
          />

          <select
            className="input"
            value={form.questionType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="mcq">MCQ</option>
            <option value="true-false">True / False</option>
            <option value="short-integer">Short Integer</option>
            <option value="short-subjective">Subjective</option>
          </select>

          {(form.questionType === "mcq" ||
            form.questionType === "true-false") && (
            <>
              {form.options.map((opt, i) => (
                <input
                  key={i}
                  className="input"
                  value={opt}
                  onChange={(e) =>
                    setOption(i, e.target.value)
                  }
                  placeholder={`Option ${i + 1}`}
                  required
                />
              ))}

              <select
                className="input"
                value={form.correctOptionIndex}
                onChange={(e) =>
                  setForm({
                    ...form,
                    correctOptionIndex: +e.target.value,
                  })
                }
              >
                {form.options.map((_, i) => (
                  <option key={i} value={i}>
                    Option {i + 1}
                  </option>
                ))}
              </select>
            </>
          )}

          {(form.questionType === "short-integer" ||
            form.questionType === "short-subjective") && (
            <input
              className="input"
              placeholder="Correct Answer"
              value={form.correctAnswer}
              onChange={(e) =>
                setForm({
                  ...form,
                  correctAnswer: e.target.value,
                })
              }
            />
          )}

          <input
            type="number"
            className="input"
            value={form.points}
            min={1}
            onChange={(e) =>
              setForm({ ...form, points: +e.target.value })
            }
          />

          {error && <p className="text-red-500 text-xs">{error}</p>}

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