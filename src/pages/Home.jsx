import { Navbar } from "../components/Navbar.jsx";
import { HeroSection } from "../components/HeroSection.jsx";
import { AboutSection } from "../components/AboutSection.jsx";
import { SkillsSection } from "../components/SkillsSection.jsx";
import { TechMarquee } from "../components/TechMarquee.jsx";
import { ProjectsSection } from "../components/ProjectsSection.jsx";
import { ContactSection } from "../components/ContactSection.jsx";
import { PageAurora } from "@/components/PageAurora";
import { CommandPaletteHost } from "@/components/CommandPaletteHost";
import { PortfolioUIProvider } from "@/context/PortfolioUI";
import { usePortfolioUI } from "@/context/portfolio-ui";

const HomeContent = () => {
  const { paletteOpen, setPaletteOpen } = usePortfolioUI();

  return (
    // No `bg-background` here, deliberately — `body` already paints it, and on
    // this element it's opaque paint sitting *above* PageAurora. Negative
    // z-index descendants are painted before block backgrounds, so the aurora
    // was rendering and then being covered by this div. The body's background
    // propagates to the canvas, which is below everything, including -z-10.
    //
    // overflow-x-clip, not overflow-x-hidden: the latter silently creates a
    // scroll container and breaks position:sticky and useScroll. Neither clips
    // the fixed aurora, whose containing block is the viewport.
    <div className="min-h-dvh text-foreground overflow-x-clip">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200]
                   focus:px-4 focus:py-2 focus:rounded-full focus:bg-primary
                   focus:text-primary-foreground focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      {/* One background for the whole document — see PageAurora. Deliberately
          not per-section: a background that stops at a section boundary is what
          makes the boundary visible. */}
      <PageAurora />
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
