import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Home, ArrowLeft, Search, Zap } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 text-center">
        
        {/* 404 Typography */}
        <div className="relative mb-8">
          <h1 className="text-[8rem] sm:text-[10rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-800/50 select-none">
            404
          </h1>
          
          {/* Glow behind the numbers */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/30 rounded-full blur-[80px] -z-10" />
          
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 sm:right-8 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
            <Search size={20} className="text-purple-400" />
          </div>
          
          <div className="absolute -bottom-2 -left-4 sm:left-8 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
            <Zap size={16} className="text-slate-500" />
          </div>
        </div>

        {/* Message */}
        <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-4">
          Page not found
        </h2>
        
        <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 font-medium rounded-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            Go back
          </button>
          
          <Link
            to={user ? dashboardPath : "/"}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Home size={16} />
            {user ? "Dashboard" : "Back home"}
            <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* Decorative code block hint */}
        <div className="mt-16 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-slate-600">
          <span className="w-2 h-2 rounded-full bg-rose-500/50 animate-pulse" />
          <span>GET</span>
          <span className="text-slate-500">{location.pathname}</span>
          <span className="text-rose-400">404 Not Found</span>
        </div>
      </div>
    </div>
  );
}