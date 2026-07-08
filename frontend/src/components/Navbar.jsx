import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../store/auth";

const links = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/journal", label: "Journal", end: false },
  { to: "/app/chat", label: "Rant AI", end: false },
  { to: "/app/insights", label: "Insights", end: false },
];

function linkClass({ isActive }) {
  return [
    "relative py-1 font-mono text-[11px] uppercase tracking-[0.18em] transition",
    isActive ? "text-ink" : "text-ink-muted hover:text-ink",
    isActive
      ? "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-accent after:content-['']"
      : "",
  ].join(" ");
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-rule/12 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <NavLink to="/app">
          <Logo />
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted sm:inline">
            {user?.displayName}
          </span>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-ink-muted transition hover:text-accent"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={17} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* mobile nav row */}
      <nav className="flex items-center justify-around border-t border-rule/12 px-2 py-2 md:hidden">
        {links.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
