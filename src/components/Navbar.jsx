import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "./lib/utils";
import { navItems } from "@/data/nav";
import { usePortfolioUI } from "@/context/portfolio-ui";
import { SPRING } from "@/lib/motion";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  // A spring is right here: the bar has no spatial relationship to the content,
  // so the slight lag reads as polish and smooths scroll-smooth's stepped deltas.
  const scaleX = useSpring(scrollYProgress, SPRING.bar);

  const { activeSection: active, goToSection, setPaletteOpen } = usePortfolioUI();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e, id) => {
    e.preventDefault();
    setIsMenuOpen(false);
    goToSection(id);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        {/* Brand */}
        <a
          href="#hero"
          onClick={(e) => go(e, "hero")}
          className="text-sm font-semibold text-foreground tracking-tight"
        >
          Jeffrey Vincent
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => go(e, item.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative text-sm transition-colors duration-200",
                  isActive ? "text-foreground" : "text-muted hover:text-foreground"
                )}
              >
                {item.name}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-px bg-primary"
                    transition={SPRING.layout}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* A hidden palette is a palette nobody uses — advertise the shortcut. */}
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command menu"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full
                       border border-border text-muted hover:text-foreground
                       hover:border-muted transition-colors duration-200 cursor-pointer"
          >
            <Search className="h-3 w-3" />
            <kbd className="text-[10px] font-medium tracking-wide">⌘K</kbd>
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command menu"
            className="sm:hidden p-2 rounded-full hover:bg-border/60 transition-colors"
          >
            <Search className="h-4 w-4 text-foreground" />
          </button>
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-full hover:bg-border/60 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-4 w-4 text-foreground" />
            ) : (
              <Menu className="h-4 w-4 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Scroll progress — decorative, the nav already communicates position */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left",
          "transition-opacity duration-300",
          isScrolled ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center gap-10",
          "bg-background/95 backdrop-blur-2xl transition-all duration-300 md:hidden",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => go(e, item.id)}
            className={cn(
              "text-2xl font-medium transition-colors",
              active === item.id ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            {item.name}
          </a>
        ))}
      </div>
    </nav>
  );
};
