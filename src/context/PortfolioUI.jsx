import { useCallback, useMemo, useState } from "react";
import { sectionIds } from "@/data/nav";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { scrollToSection } from "@/lib/scroll";
import { ALL_TAG, PortfolioUIContext } from "./portfolio-ui";

/**
 * The small amount of state more than one component needs: the projects filter
 * (driven by both the chip row and the command palette), theme, palette
 * visibility, and section navigation — shared so scroll-spy stays correct no
 * matter how you navigate.
 *
 * One scroll-spy observer lives here rather than in the Navbar, so adding more
 * consumers never means more observers.
 */
export const PortfolioUIProvider = ({ children }) => {
  const [filter, setFilter] = useState(ALL_TAG);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const { active, lockTo } = useScrollSpy(sectionIds);

  const goToSection = useCallback(
    (id) => {
      lockTo(id);
      scrollToSection(id);
    },
    [lockTo]
  );

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // private mode — still works for this session
      }
      return next;
    });
  }, []);

  const filterAndScroll = useCallback(
    (tag) => {
      setFilter(tag);
      goToSection("projects");
    },
    [goToSection]
  );

  const value = useMemo(
    () => ({
      filter,
      setFilter,
      filterAndScroll,
      isDark,
      toggleTheme,
      activeSection: active,
      goToSection,
      paletteOpen,
      setPaletteOpen,
    }),
    [filter, filterAndScroll, isDark, toggleTheme, active, goToSection, paletteOpen]
  );

  return (
    <PortfolioUIContext.Provider value={value}>{children}</PortfolioUIContext.Provider>
  );
};
