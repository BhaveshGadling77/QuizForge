import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { getQuestions, addQuestion, deleteQuestion } from "@/services/quizService";
import Navbar from "@/components/Navbar";

const emptyForm = () => ({ text: "", options: ["", "", "", ""], correctOption: 0 });

export default function AddQuestions() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: questions = [], isLoading } = useQuery(["questions", id], () =>
    getQuestions(id).then((r) => r.data.questions)
  );
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addQuestion(id, form);
      qc.invalidateQueries(["questions", id]);
      setForm(emptyForm());
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qId) => {
    await deleteQuestion(id, qId);
    qc.invalidateQueries(["questions", id]);
  };

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin" className="text-forge-muted hover:text-forge-text text-sm">← Dashboard</Link>
            <h1 className="font-display font-bold text-2xl text-forge-text mt-1">Add Questions</h1>
          </div>
          <span className="badge bg-forge-border text-forge-muted font-mono">{questions.length} questions</span>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="card mb-8 flex flex-col gap-4">
          <div>
            <label className="label">Question Text</label>
            <textarea className="input h-20 resize-none" placeholder="Enter the question…"
              value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {form.options.map((opt, i) => (
              <div key={i}>
                <label className="label">Option {String.fromCharCode(65 + i)}</label>
                <input className={`input ${form.correctOption === i ? "border-forge-green" : ""}`}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt} onChange={(e) => setOption(i, e.target.value)} required />
              </div>
            ))}
          </div>
          <div>
            <label className="label">Correct Answer</label>
            <select className="input" value={form.correctOption}
              onChange={(e) => setForm({ ...form, correctOption: +e.target.value })}>
              {form.options.map((_, i) => (
                <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-forge-red text-xs font-mono">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Adding…" : "+ Add Question"}
          </button>
        </form>

        {/* Existing questions */}
        {isLoading ? (
          <div className="card h-32 animate-pulse" />
        ) : (
          <div className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <div key={q._id} className="card flex items-start justify-between gap-4">
                <div>
                  <p className="text-forge-muted font-mono text-xs mb-1">Q{i + 1}</p>
                  <p className="text-forge-text text-sm">{q.text}</p>
                </div>
                <button onClick={() => handleDelete(q._id)}
                  className="text-forge-red hover:text-forge-red/70 text-xs font-mono shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}