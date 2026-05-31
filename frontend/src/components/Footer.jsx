import { useLocation, Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa6";
import { FaTwitter } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { useState } from "react";
import {
  ArrowUpRight,
  Mail,
  Heart,
  ArrowUp,
  CheckCircle2,
  Radio,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#0a0a0f] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-8">
        {/* Top section */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 pb-12 border-white/10">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group mb-4"
            >
              <img
                src="/favicon.svg"
                alt="QuizForge Logo"
                className="w-8 h-8 rounded-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              />
              <span className="text-xl font-bold tracking-tight text-slate-100">
                Quiz<span className="text-purple-400">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              A personal project for creating and sharing quizzes. Built with
              React, Node.js, and caffeine.
            </p>

            {/* Social Icons - only real ones */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/BhaveshGadling77/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                <FaGithub size={18} />
              </a>
              <a
                href="https://x.com/bhaveshbg27"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="mailto:bhaveshgadling2025@gmail.com"
                aria-label="Email"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mt-[122px] justify-between gap-6 mb-8">
            <div className="flex flex-wrap items-center gap-6">
              {isLandingPage && (
                <>
                  <a
                    href="#features"
                    className="text-sm text-slate-500 hover:text-purple-400 transition-colors duration-200"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-sm text-slate-500 hover:text-purple-400 transition-colors duration-200"
                  >
                    How it works
                  </a>
                  <a
                    href="#testimonials"
                    className="text-sm text-slate-500 hover:text-purple-400 transition-colors duration-200"
                  >
                    Reviews
                  </a>
                </>
              )}
              <Link
                to="/about"
                className="text-sm text-slate-500 hover:text-purple-400 transition-colors duration-200"
              >
                About
              </Link>
            </div>

            <a
              href="https://github.com/BhaveshGadling77/QuizForge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-400 transition-colors duration-200 group"
            >
              View source on GitHub
              <ExternalLink
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className=" border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Built with</span>
            <Heart
              size={12}
              className="text-pink-500 fill-pink-500 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
            <span>by a Bhavesh Gadling</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-600">
              <Radio size={12} className="text-emerald-400" />
              All systems operational
            </span>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              Top
              <ArrowUp
                size={12}
                className="group-hover:-translate-y-0.5 transition-transform duration-200"
              />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-4">
          © {new Date().getFullYear()} QuizForge. Personal project.
        </p>
      </div>
    </footer>
  );
}
