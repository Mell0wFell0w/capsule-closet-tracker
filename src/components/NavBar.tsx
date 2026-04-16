import { NavLink } from "react-router-dom";
import { Shirt, RefreshCw, BarChart2, Sun, Moon } from "lucide-react";

interface NavBarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function NavBar({ theme, onToggleTheme }: NavBarProps) {
  return (
    <nav className="navbar">
      <span className="navbar-brand">Capsule Closet</span>
      <div className="navbar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <Shirt size={16} />
          <span>Closet</span>
        </NavLink>
        <NavLink
          to="/replacements"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <RefreshCw size={16} />
          <span>Replacements</span>
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <BarChart2 size={16} />
          <span>Stats</span>
        </NavLink>
      </div>
      <div className="navbar-actions">
        <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </div>
    </nav>
  );
}
