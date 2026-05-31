import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import Avatar from "@/components/Avatar";
import { Zap, LogOut, Menu, X, ChevronRight, User, LayoutDashboard, FilePlus, History, Info } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const NavLink = ({ to, children, exact = false }) => {
    const active = exact ? location.pathname === to : location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative text-sm font-medium transition-colors duration-300 group py-1 ${
          active ? "text-purple-400" : "text-slate-400 hover:text-slate-100"
        }`}
      >
        {children}
        <span
          className={`absolute -bottom-0.5 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-300 ease-out ${
            active ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </Link>
    );
  };

  const studentLinks = (
    <>
      <NavLink to="/dashboard">Quizzes</NavLink>
      <NavLink to="/history">History</NavLink>
      <NavLink to="/about">About</NavLink>
    </>
  );

  const adminLinks = (
    <>
      <NavLink to="/admin">Dashboard</NavLink>
      <NavLink to="/admin/create">Create Quiz</NavLink>
      <NavLink to="/about">About</NavLink>
    </>
  );

  const loggedOutLinks = (
    <>
      <NavLink to="/about">About</NavLink>
    </>
  );

  return (
    <nav
      ref={menuRef}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        
        {/* ── Logo ── */}
        <Link to={"/"} className="flex items-center gap-2.5 group shrink-0">
          <img src="/favicon.svg" alt="Quizforge logo" width={35}></img>
          <span className="font-bold text-lg tracking-tight text-slate-100">
            Quiz<span className="text-purple-400">Forge</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden sm:flex items-center gap-8 flex-1 justify-center">
          {!user && loggedOutLinks}
          {user?.role === "student" && studentLinks}
          {user?.role === "admin" && adminLinks}
        </div>

        {/* ── Right side: authenticated ── */}
        {user ? (
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Role chip */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold capitalize tracking-wide transition-all duration-300 ${
                user.role === "admin"
                  ? "border-purple-500/25 bg-purple-500/10 text-purple-300 shadow-sm shadow-purple-500/10"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-sm shadow-emerald-500/10"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  user.role === "admin" ? "bg-purple-400" : "bg-emerald-400"
                }`}
              />
              {user.role}
            </span>

            <span className="w-px h-5 bg-white/10" />

            {/* Avatar + Name */}
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="relative">
                <Avatar user={user} size="w-8 h-8" textSize="text-xs" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0f] ${
                  user.role === "admin" ? "bg-purple-400" : "bg-emerald-400"
                }`} />
              </div>
              <span className="text-slate-200 text-sm font-medium max-w-[120px] truncate group-hover:text-purple-300 transition-colors duration-200">
                {user.name}
              </span>
            </div>

            <span className="w-px h-5 bg-white/10" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <LogOut size={13} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        ) : (
          /* ── Right side: logged out ── */
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors duration-300 px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get started
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        )}

        {/* ── Mobile: hamburger ── */}
        <div className="sm:hidden flex items-center gap-2">
          {!user && (
            <Link
              to="/login"
              className="text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors px-2 py-1"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-white/10 bg-[#0a0a0f]/98 backdrop-blur-xl px-6 py-6 flex flex-col gap-2">
          
          {user && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  user.role === "admin"
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                }`}>
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0f] ${
                  user.role === "admin" ? "bg-purple-400" : "bg-emerald-400"
                }`} />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-100 text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-slate-500 font-mono capitalize">{user.role}</span>
              </div>
            </div>
          )}

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {!user && (
              <MobileNavLink to="/about" active={location.pathname === "/about"} icon={Info}>
                About
              </MobileNavLink>
            )}
            
            {user?.role === "student" && (
              <>
                <MobileNavLink to="/dashboard" active={location.pathname === "/dashboard"} icon={LayoutDashboard}>
                  Quizzes
                </MobileNavLink>
                <MobileNavLink to="/history" active={location.pathname === "/history"} icon={History}>
                  History
                </MobileNavLink>
                <MobileNavLink to="/about" active={location.pathname === "/about"} icon={Info}>
                  About
                </MobileNavLink>
              </>
            )}
            
            {user?.role === "admin" && (
              <>
                <MobileNavLink to="/admin" active={location.pathname === "/admin"} icon={LayoutDashboard}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink to="/admin/create" active={location.pathname === "/admin/create"} icon={FilePlus}>
                  Create Quiz
                </MobileNavLink>
                <MobileNavLink to="/about" active={location.pathname === "/about"} icon={Info}>
                  About
                </MobileNavLink>
              </>
            )}
          </div>

          {/* Auth buttons */}
          <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 transition-all duration-300"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-500/25 transition-all duration-300"
                >
                  Get started
                  <ChevronRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── Mobile Nav Link helper ──────────────────────────────────────────────────
function MobileNavLink({ to, children, active, icon: Icon }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm shadow-purple-500/10"
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
      }`}
    >
      <Icon size={16} className={active ? "text-purple-400" : "text-slate-500"} />
      {children}
      {active && <ChevronRight size={14} className="ml-auto text-purple-400" />}
    </Link>
  );
}