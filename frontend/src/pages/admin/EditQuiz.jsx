import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getQuizById, updateQuiz, publishQuiz } from "@/services/quizService";
import Navbar from "@/components/Navbar";
import { QUIZ_STATUS } from "@/utils/constants";

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quiz, isLoading } = useQuery(["quiz", id], () =>
    getQuizById(id).then((r) => r.data.quiz)
  );
  const [form, setForm] = useState({ title: "", description: "", duration: 30 });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (quiz) setForm({ title: quiz.title, description: quiz.description, duration: quiz.duration });
  }, [quiz]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateQuiz(id, form);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishQuiz(id);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message ?? "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-forge-bg"><Navbar /></div>;

  return (
    <div className="min-h-screen bg-forge-bg">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 py-10">
        <Link to="/admin" className="text-forge-muted hover:text-forge-text text-sm mb-6 inline-block">
          ← Dashboard
        </Link>
        <h1 className="font-display font-bold text-2xl text-forge-text mb-6">Edit Quiz</h1>

        <form onSubmit={handleSave} className="card flex flex-col gap-4 mb-4">
          <div>
            <label className="label">Title</label>
            <input className="input" type="text" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-24 resize-none" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input className="input" type="number" min={1} value={form.duration}
              onChange={(e) => setForm({ ...form, duration: +e.target.value })} />
          </div>
          {error && <p className="text-forge-red text-xs font-mono">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        {quiz?.status === QUIZ_STATUS.DRAFT && (
          <button onClick={handlePublish} disabled={publishing} className="btn-ghost w-full disabled:opacity-50">
            {publishing ? "Publishing…" : "Publish Quiz"}
          </button>
        )}
      </main>
    </div>
  );
}