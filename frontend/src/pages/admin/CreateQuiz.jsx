import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createQuiz } from "@/services/quizService";
import { useAuth } from "@/hooks/useAuth"
import Navbar from "@/components/Navbar";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // console.log("Current user:", user); // Debug log to check user data
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 30,
    visibility: "public",
    accessToken: "",
    timerEnabled: true,
    autoSubmit: true,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const payload = {
      title: form.title,
      description: form.description,
      durationSeconds: form.duration * 60,
      visibility: form.visibility,
      accessToken:
        form.visibility === "private" ? form.accessToken : null,
      timerEnabled: form.timerEnabled,
      autoSubmit: form.autoSubmit,
      isActive: false,
      totalQuestions: 0,
      totalPoints: 0,
      createdBy: user.id
    };

    const res = await createQuiz(payload);
    console.log(res.data);
    // fix
    const quizId = res.data.quiz.quizId || res.data.quiz.id || res.data.quiz._id;

    navigate(`/admin/quiz/${quizId}/questions`);
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
        <Link to="/admin" className="text-sm mb-6 inline-block">
          ← Dashboard
        </Link>

        <h1 className="text-2xl mb-6">Create Quiz</h1>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <input
            className="input"
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            required
          />

          <textarea
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <input
            type="number"
            className="input"
            value={form.duration}
            onChange={(e) =>
              setForm({ ...form, duration: +e.target.value })
            }
          />

          {/* Visibility */}
          <select
            className="input"
            value={form.visibility}
            onChange={(e) =>
              setForm({ ...form, visibility: e.target.value })
            }
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          {/* Access Token */}
          {form.visibility === "private" && (
            <input
              className="input"
              placeholder="Access Token"
              value={form.accessToken}
              onChange={(e) =>
                setForm({ ...form, accessToken: e.target.value })
              }
              required
            />
          )}

          {/* Toggles */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.timerEnabled}
              onChange={(e) =>
                setForm({ ...form, timerEnabled: e.target.checked })
              }
            />
            Timer Enabled
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.autoSubmit}
              onChange={(e) =>
                setForm({ ...form, autoSubmit: e.target.checked })
              }
            />
            Auto Submit
          </label>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button className="btn-primary">
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </form>
      </main>
    </div>
  );
}