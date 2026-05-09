import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import Avatar from "@/components/Avatar";
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

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Close menu on outside click
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

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const NavLink = ({ to, children, exact = false }) => {
    const active = exact ? location.pathname === to : location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative text-sm font-medium transition-colors duration-200 group ${
          active
            ? "text-forge-accent"
            : "text-forge-muted hover:text-forge-text"
        }`}
      >
        {children}
        <span
          className={`absolute -bottom-0.5 left-0 h-px bg-forge-accent transition-all duration-300 ${
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
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-forge-bg/95 backdrop-blur-lg border-forge-border shadow-sm shadow-black/20"
          : "bg-forge-bg/70 backdrop-blur-md border-forge-border/60"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* ── Logo ── */}
        <Link to={"/"} className="flex items-center gap-2 group shrink-0">
          <img
            src="/favicon.svg"
            alt="QuizForge Logo"
            className="w-7 h-7 rounded-md"
          />
          <span className="font-bold text-base tracking-tight">
            Quiz<span className="text-forge-accent">Forge</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden sm:flex items-center gap-6 flex-1 justify-center">
          {!user && loggedOutLinks}
          {user?.role === "student" && studentLinks}
          {user?.role === "admin" && adminLinks}
        </div>

        {/* ── Right side: authenticated ── */}
        {user ? (
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Role chip */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono capitalize tracking-wide transition-colors ${
                user.role === "admin"
                  ? "border-forge-accent/25 bg-forge-accent/8 text-forge-accent"
                  : "border-emerald-500/25 bg-emerald-500/8 text-emerald-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  user.role === "admin" ? "bg-forge-accent" : "bg-emerald-400"
                }`}
              />
              {user.role}
            </span>

            {/* Divider */}
            <span className="w-px h-4 bg-forge-border" />

            {/* Avatar + Name */}
            <div className="flex items-center gap-2">
              <Avatar user={user} size="w-8 h-8" textSize="text-xs" />
              <span className="text-forge-text text-sm font-medium max-w-[120px] truncate">
                {user.name}
              </span>
            </div>

            {/* Divider */}
            <span className="w-px h-4 bg-forge-border" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-forge-muted hover:text-forge-red border border-transparent hover:border-forge-red/20 hover:bg-forge-red/5 px-2.5 py-1.5 rounded-md transition-all duration-200"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="opacity-70"
              >
                <path
                  d="M8 2l3 4-3 4M11 6H4M1 1v10"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </button>
          </div>
        ) : (
          /* ── Right side: logged out ── */
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="text-sm font-medium text-forge-muted hover:text-forge-text transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-md border border-forge-accent/30 bg-forge-accent/10 hover:bg-forge-accent/20 px-3 py-1.5 text-sm font-semibold text-forge-accent transition-all duration-200"
            >
              Get started
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6h8M7 3l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        )}

        {/* ── Mobile: hamburger (authenticated) or sign-in (guest) ── */}
        <div className="sm:hidden flex items-center gap-2">
          {!user && (
            <Link
              to="/login"
              className="text-xs font-medium text-forge-muted hover:text-forge-text transition-colors"
            >
              Sign in
            </Link>
          )}
          {user && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-md text-forge-muted hover:text-forge-text hover:bg-forge-border/30 transition-all duration-200"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span
                className={`block h-px w-[18px] bg-current transition-all duration-250 origin-center ${
                  menuOpen ? "rotate-45 translate-y-[6px]" : ""
                }`}
              />
              <span
                className={`block h-px w-[18px] bg-current transition-all duration-200 ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-px w-[18px] bg-current transition-all duration-250 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      {user && (
        <div
          className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-forge-border bg-forge-bg/98 backdrop-blur-md px-6 py-5 flex flex-col gap-5">
            {/* Nav links */}
            <div className="flex flex-col gap-1">
              {user.role === "student" && (
                <>
                  <MobileNavLink
                    to="/dashboard"
                    active={location.pathname === "/dashboard"}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="shrink-0"
                    >
                      <path
                        d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Quizzes
                  </MobileNavLink>
                  <MobileNavLink
                    to="/about"
                    active={location.pathname === "/about"}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="shrink-0"
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M7 6v4M7 4.5v.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    About
                  </MobileNavLink>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <MobileNavLink
                    to="/admin"
                    active={location.pathname === "/admin"}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="shrink-0"
                    >
                      <path
                        d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Dashboard
                  </MobileNavLink>
                  <MobileNavLink
                    to="/admin/create"
                    active={location.pathname === "/admin/create"}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="shrink-0"
                    >
                      <path
                        d="M7 1v12M1 7h12"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    Create Quiz
                  </MobileNavLink>
                  <MobileNavLink
                    to="/about"
                    active={location.pathname === "/about"}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="shrink-0"
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M7 6v4M7 4.5v.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    About
                  </MobileNavLink>
                </>
              )}
            </div>

            {/* User footer */}
            <div className="pt-4 border-t border-forge-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    user.role === "admin"
                      ? "bg-forge-accent/15 text-forge-accent border border-forge-accent/25"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  }`}
                >
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-forge-text text-sm font-medium leading-tight">
                    {user.name}
                  </span>
                  <span className="text-forge-muted text-xs font-mono capitalize leading-tight">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-forge-muted hover:text-forge-red border border-transparent hover:border-forge-red/20 hover:bg-forge-red/5 px-2.5 py-1.5 rounded-md transition-all duration-200"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M8 2l3 4-3 4M11 6H4M1 1v10"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Mobile Nav Link helper ──────────────────────────────────────────────────
function MobileNavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-forge-accent/10 text-forge-accent border border-forge-accent/15"
          : "text-forge-muted hover:text-forge-text hover:bg-forge-border/30 border border-transparent"
      }`}
    >
      {children}
    </Link>
  );
}
