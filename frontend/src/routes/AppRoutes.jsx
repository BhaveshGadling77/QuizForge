import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// Not Found page
import NotFoundPage from "@/pages/NotFound";
//Landing page
import Landing from "@/pages/Landing";
// about page
import About from "@/pages/About";
// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
// Student pages
import Dashboard from "@/pages/Dashboard";
import QuizDetails from "@/pages/QuizDetails";
import AttemptQuiz from "@/pages/AttemptQuiz";
import Result from "@/pages/Result";
import Leaderboard from "@/pages/Leaderboard";
import StudentHistory from "@/pages/StudentHistory";
// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CreateQuiz from "@/pages/admin/CreateQuiz";
import EditQuiz from "@/pages/admin/EditQuiz";
import AddQuestions from "@/pages/admin/AddQuestions";
import EditQuestion from "@/pages/admin/EditQuestion";
import ViewResults from "@/pages/admin/ViewResults";
import EvaluateResult from "@/pages/admin/EvaluateResult";
// Guard
import ProtectedRoute from "@/components/ProtectedRoute";

const getRedirectPath = (user) => {
  if (!user) return "/";
  return user.role === "admin" ? "/admin" : "/dashboard";
};

export default function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route
        path="/login"
        element={
          user ? <Navigate to={getRedirectPath(user)} replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to={getRedirectPath(user)} replace /> : <Register />
        }
      />

      {/* Student */}
      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz/:id" element={<QuizDetails />} />
        <Route path="/quiz/:id/attempt" element={<AttemptQuiz />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/leaderboard/:id" element={<Leaderboard />} />
        <Route path="/history" element={<StudentHistory />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create" element={<CreateQuiz />} />
        <Route path="/admin/edit/:id" element={<EditQuiz />} />
        <Route path="/admin/quiz/:id/questions" element={<AddQuestions />} />
        <Route
          path="/admin/quiz/:id/questions/:questionId/edit"
          element={<EditQuestion />}
        />
        <Route path="/admin/quiz/:id/results" element={<ViewResults />} />
        <Route path="/admin/quiz/:id/results/:userId" element={<EvaluateResult />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
