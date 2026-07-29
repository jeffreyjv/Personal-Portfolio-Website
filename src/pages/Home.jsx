import { Navbar } from "../components/Navbar.jsx";
import { HeroSection } from "../components/HeroSection.jsx";
import { AboutSection } from "../components/AboutSection.jsx";
import { SkillsSection } from "../components/SkillsSection.jsx";
import { TechMarquee } from "../components/TechMarquee.jsx";
import { ProjectsSection } from "../components/ProjectsSection.jsx";
import { ContactSection } from "../components/ContactSection.jsx";
import { StarBackground } from "@/components/StarBackground";
import { CommandPaletteHost } from "@/components/CommandPaletteHost";
import { PortfolioUIProvider } from "@/context/PortfolioUI";
import { usePortfolioUI } from "@/context/portfolio-ui";

const HomeContent = () => {
  const { paletteOpen, setPaletteOpen } = usePortfolioUI();

  return (
    <div className="min-h-dvh bg-background text-foreground overflow-x-clip">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200]
                   focus:px-4 focus:py-2 focus:rounded-full focus:bg-primary
                   focus:text-primary-foreground focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <StarBackground />
      <Navbar />
      <main id="main">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        {/* Deliberately not a section: a short decorative band between the two
            densest parts of the page. It has no id, so scroll-spy ignores it. */}
        <TechMarquee />
        <ProjectsSection />
        <ContactSection />
      </main>
      <CommandPaletteHost open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
};

export const Home = () => (
  <PortfolioUIProvider>
    <HomeContent />
  </PortfolioUIProvider>
);
