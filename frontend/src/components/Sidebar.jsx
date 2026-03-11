import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const studentLinks = [
  { label: "Quizzes", to: "/dashboard" },
];

const adminLinks = [
  { label: "Overview", to: "/admin" },
  { label: "Create Quiz", to: "/admin/create" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className="w-56 shrink-0 border-r border-forge-border min-h-screen pt-8 px-4">
      <nav className="flex flex-col gap-1">
        {links.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-body transition-all ${
                isActive
                  ? "bg-forge-accent/10 text-forge-accent font-medium"
                  : "text-forge-muted hover:text-forge-text hover:bg-forge-border/40"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}