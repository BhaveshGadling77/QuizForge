import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
//Lading page
import Landing from "@/pages/Landing";
// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
// Student pages
import Dashboard from "@/pages/Dashboard";
import QuizDetails from "@/pages/QuizDetails";
import AttemptQuiz from "@/pages/AttemptQuiz";
import Result from "@/pages/Result";
import Leaderboard from "@/pages/Leaderboard";
// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CreateQuiz from "@/pages/admin/CreateQuiz";
import EditQuiz from "@/pages/admin/EditQuiz";
import AddQuestions from "@/pages/admin/AddQuestions";
import EditQuestion from "@/pages/admin/EditQuestion";
import ViewResults from "@/pages/admin/ViewResults";
// Guard
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
            : <Landing />
        }
      />
      <Route path="/about" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student */}
      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz/:id" element={<QuizDetails />} />
        <Route path="/quiz/:id/attempt" element={<AttemptQuiz />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/leaderboard/:id" element={<Leaderboard />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create" element={<CreateQuiz />} />
        <Route path="/admin/edit/:id" element={<EditQuiz />} />
        <Route path="/admin/quiz/:id/questions" element={<AddQuestions />} />
        <Route path="/admin/quiz/:id/questions/:questionId/edit" element={<EditQuestion />} />
        <Route path="/admin/quiz/:id/results" element={<ViewResults />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}