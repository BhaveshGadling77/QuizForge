import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import {
  getQuizzes,
  publishQuiz,
  unpublishQuiz,
  deleteQuiz,
} from "@/services/quizService";
import { formatDate, truncate } from "@/utils/helpers";
import toast from "react-hot-toast";
// ─── utils ────────────────────────────────────────────────────────────────────
const getStatus = (quiz) => {
  if (!quiz.isActive) return "DRAFT";
  if ((quiz.totalQuestions ?? 0) === 0) return "EMPTY";
  return "PUBLISHED";
};

const STATUS_CFG = {
  PUBLISHED: {
    dot: "bg-forge-green",
    chip: "bg-forge-green/10 text-forge-green border-forge-green/20",
    label: "Published",
  },
  DRAFT: {
    dot: "bg-forge-yellow",
    chip: "bg-forge-yellow/10 text-forge-yellow border-forge-yellow/20",
    label: "Draft",
  },
  EMPTY: {
    dot: "bg-forge-muted/40",
    chip: "bg-forge-gray/10 text-forge-muted border-forge-border",
    label: "Empty",
  },
};



// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, delay = 0 }) {
  return (
    <div
      className="stat-card flex items-center gap-4 px-5 py-4 rounded-2xl border border-forge-border bg-forge-surface"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-xl bg-forge-accent/10 border border-forge-accent/15 flex items-center justify-center text-forge-accent shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-xs text-forge-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Delete Confirm Inline ────────────────────────────────────────────────────
function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="delete-confirm flex items-center gap-2">
      <span className="text-xs text-forge-muted">Sure?</span>
      <button
        onClick={onConfirm}
        className="action-btn text-xs font-semibold text-red-400 hover:bg-red-500/10"
      >
        Yes, delete
      </button>
      <button
        onClick={onCancel}
        className="action-btn text-xs text-forge-muted hover:bg-forge-border/50"
      >
        Cancel
      </button>
    </div>
  );
}

// ─── Quiz Row ─────────────────────────────────────────────────────────────────


function QuizRow({ quiz, onPublish, onUnpublish, onDelete, style }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cfg = STATUS_CFG[quiz.status];

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
    toast.success("Quiz deleted");
  };

  return (
    <tr className={`quiz-row border-b border-forge-border/60 row-enter ${deleting ? "deleting" : ""}`} style={style}>
      {/* Title */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm leading-snug">
            {truncate(quiz.title, 42)}
          </span>
          <span className="text-[11px] text-forge-muted/60">
            ID: {quiz.id?.slice(0, 8)}…
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.chip}`}>
          <span className={`pub-dot ${cfg.dot}`} />
          {cfg.label}
        </span>
      </td>

      {/* Questions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums">
            {quiz.totalQuestions ?? 0}
          </span>
          <span className="text-xs text-forge-muted/50">qs</span>
        </div>
      </td>

      {/* Created */}
      <td className="px-5 py-4 text-xs text-forge-muted">
        {formatDate(quiz.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        {confirming ? (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <div className="flex items-center gap-1 flex-wrap">
            {quiz.isActive ? (
              <button
                onClick={() => onUnpublish(quiz.id)}
                className="action-btn text-xs text-forge-yellow hover:bg-forge-yellow/10 font-medium"
              >
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => onPublish(quiz.id)}
                className="action-btn text-xs text-forge-green hover:bg-forge-green/10 font-medium"
              >
                Publish
              </button>
            )}

            <span className="text-forge-border/60 text-xs select-none">·</span>

            {/* ── NEW: Edit button ── */}
            <Link
              to={`/admin/edit/${quiz.id}`}
              className="action-btn text-xs text-forge-accent hover:bg-forge-accent/10 font-medium"
            >
              Edit
            </Link>

            <Link
              to={`/admin/quiz/${quiz.id}/questions`}
              className="action-btn text-xs text-forge-muted hover:bg-forge-border/50"
            >
              Questions
            </Link>

            <Link
              to={`/admin/quiz/${quiz.id}/results`}
              className="action-btn text-xs text-forge-muted hover:bg-forge-border/50"
            >
              Results
            </Link>

            <span className="text-forge-border/60 text-xs select-none">·</span>

            <button
              onClick={() => setConfirming(true)}
              className="action-btn text-xs text-red-500/60 hover:text-red-400 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRows() {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr key={i} className="border-b border-forge-border/40">
      {[140, 80, 40, 90, 180].map((w, j) => (
        <td key={j} className="px-5 py-4">
          <div className="skel h-4" style={{ width: w }} />
        </td>
      ))}
    </tr>
  ));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

const { data, isLoading } = useQuery(
  "admin-quizzes",
  () => getQuizzes(),
  {
    retry: false,
    refetchOnWindowFocus: false,
  }
);
  const handleDeleteQuiz = async (quizId) => {
    qc.setQueryData("admin-quizzes", (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          quizzes: oldData.data.quizzes.filter((q) => q.quizId !== quizId),
        },
      };
    });
    await deleteQuiz(quizId);
    qc.invalidateQueries("admin-quizzes");
  toast.success("Quiz deleted successfully.")
  };

  const publishMutation = useMutation((quizId) => publishQuiz(quizId), {
    onSuccess: () => {
      toast.success("Quiz published successfully.");
      return qc.invalidateQueries("admin-quizzes")},
  });
  const unpublishMutation = useMutation((quizId) => unpublishQuiz(quizId), {
    onSuccess: () => { 
       toast.success("Quiz unpublished successfully.");
      return qc.invalidateQueries("admin-quizzes")
    },
    // onSuccess: () =>,
  });

  const raw = data?.data?.quizzes ?? [];
  const normalized = raw.map((q) => ({
    ...q,
    id: q.quizId,
    status: getStatus(q),
    
  }));
  // console.log("Normalized quizzes:", normalized);
  // Stats
  const total = normalized.length;
  const published = normalized.filter((q) => q.status === "PUBLISHED").length;
  const drafts = normalized.filter((q) => q.status === "DRAFT").length;
  const totalQs = normalized.reduce((s, q) => s + (q.totalQuestions ?? 0), 0);

  // Filter + search
  const filtered = normalized.filter((q) => {
    const matchSearch = q.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "EMPTY"];

  return (
    <div className="min-h-screen bg-forge-bg">

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-forge-muted mt-0.5">
              Manage your quizzes and track results
            </p>
          </div>
          <Link
            to="/admin/create"
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Quiz
          </Link>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Total Quizzes" value={isLoading ? "—" : total} delay={0}
            icon={<svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>}
          />
          <StatCard
            label="Published" value={isLoading ? "—" : published} delay={60}
            icon={<svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
          />
          <StatCard
            label="Drafts" value={isLoading ? "—" : drafts} delay={120}
            icon={<svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>}
          />
          <StatCard
            label="Total Questions" value={isLoading ? "—" : totalQs} delay={180}
            icon={<svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>}
          />
        </div>

        {/* ── Filters & Search ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-muted/50 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              className="search-input input pl-9 w-full text-sm"
              placeholder="Search quizzes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                  ${filterStatus === f
                    ? "border-forge-accent bg-forge-accent/10 text-forge-accent"
                    : "border-forge-border text-forge-muted hover:border-forge-accent/30 hover:text-forge-accent/70"
                  }`}
              >
                {f === "ALL" ? "All" : STATUS_CFG[f]?.label ?? f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="border border-forge-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-forge-surface border-b border-forge-border">
                {["Title", "Status", "Questions", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-forge-muted/70 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-forge-muted/40">
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-sm">
                        {search || filterStatus !== "ALL"
                          ? "No quizzes match your filters"
                          : "No quizzes yet — create your first one!"}
                      </p>
                      {!search && filterStatus === "ALL" && (
                        <Link to="/admin/create" className="btn-primary text-xs mt-1">
                          + Create Quiz
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((quiz, i) => (
                  <QuizRow
                    key={quiz.id}
                    quiz={quiz}
                    style={{ animationDelay: `${i * 40}ms` }}
                    onPublish={(id) => publishMutation.mutate(id)}
                    onUnpublish={(id) => unpublishMutation.mutate(id)}
                    onDelete={() => handleDeleteQuiz(quiz.id)}
                  />
                ))
              )}
            </tbody>
          </table>

          {/* Footer count */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-forge-border/60 bg-forge-surface/50 flex items-center justify-between">
              <p className="text-xs text-forge-muted/50">
                Showing <span className="font-semibold text-forge-muted">{filtered.length}</span> of <span className="font-semibold text-forge-muted">{total}</span> quizzes
              </p>
              {filterStatus !== "ALL" || search ? (
                <button
                  onClick={() => { setSearch(""); setFilterStatus("ALL"); }}
                  className="text-xs text-forge-accent hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}