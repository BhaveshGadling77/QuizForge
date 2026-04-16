import { useLocation } from "react-router-dom";
export default function Footer() {
    const location = useLocation();
    const isLandingPage = location.pathname === "/";

    return (
        <footer className="border-t border-forge-border bg-forge-bg/95">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
                src="/favicon.svg"
                alt="QuizForge Logo"
                className="w-7 h-7 rounded-md"
            />
            <span className="font-semibold">
              Quiz<span className="text-forge-accent">Forge</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-forge-muted">
            {isLandingPage && (
                <>
                <a href="#features" className="hover:text-forge-text transition-colors">
                    Features
                </a>
                <a href="#how-it-works" className="hover:text-forge-text transition-colors">
                    How it works
                </a>
                <a href="#testimonials" className="hover:text-forge-text transition-colors">
                    Reviews
                </a>
                </>
            )}
            </div>
          <p className="text-sm text-forge-muted">© {new Date().getFullYear()} QuizForge.</p>
        </div>
      </footer>
    );
}