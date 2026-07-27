import { Moon, Sun } from "lucide-react";
import { usePortfolioUI } from "@/context/portfolio-ui";

/**
 * Theme state lives in PortfolioUI so this button and the command palette's
 * "Switch to light/dark mode" action can never disagree. The class itself is
 * applied before first paint by the inline script in index.html.
 */
export const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = usePortfolioUI();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-full transition-colors duration-200 hover:bg-border/60 ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </button>
  );
};
