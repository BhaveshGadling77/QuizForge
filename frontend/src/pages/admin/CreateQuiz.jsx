import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createQuiz } from "@/services/quizService";
import Navbar from "@/components/Navbar";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", duration: 30 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await createQuiz(form);
    console.log("CREATE QUIZ RESPONSE:", res.data); //new
    navigate(`/admin/quiz/${res.data.quiz._id}/questions`);
  } catch (err) {
    setError(err.response?.data?.message ?? "Failed to create quiz");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 py-10">
        <Link to="/admin" className="text-forge-muted hover:text-forge-text text-sm mb-6 inline-block">
          ← Dashboard
        </Link>
        <h1 className="font-display font-bold text-2xl text-forge-text mb-6">Create Quiz</h1>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div>
            <label className="label">Title</label>
            <input className="input" type="text" placeholder="e.g. Data Structures – Midterm"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-24 resize-none" placeholder="Brief description of the quiz…"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input className="input" type="number" min={1} max={180}
              value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} required />
          </div>

          {error && <p className="text-forge-red text-xs font-mono">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Creating…" : "Create & Add Questions →"}
          </button>
        </form>
      </main>
    </div>
  );
}