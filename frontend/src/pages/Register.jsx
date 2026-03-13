import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/utils/constants";


export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: ROLES.STUDENT });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await register(form);
      console.log(res)
      login(res.data.token, res.data.user);
      navigate(e.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forge-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-forge-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display font-bold text-3xl mb-1">
            Quiz<span className="text-forge-accent">Forge</span>
          </h1>
          <p className="text-forge-muted text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div>
            <label className="label">Name</label>
            <input className="input" type="text" placeholder="Akshay Kumar"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value={ROLES.STUDENT}>Student</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </div>

          {error && <p className="text-forge-red text-xs font-mono">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-1 disabled:opacity-50">
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="text-center text-forge-muted text-sm mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-forge-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}