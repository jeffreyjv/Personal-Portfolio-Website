import { ThemeToggle } from "../components/ThemeToggle"
import { Navbar } from "../components/Navbar.jsx";
import { AboutSection } from "../components/AboutSection.jsx";
import { HeroSection } from "../components/HeroSection.jsx";

export const Home = () => {
  return (
    <div className="min-h-dvh bg-background text--foreground overflow-x-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Navbar */}
      <Navbar />
      {/* Main Content */}
      <main>
        <HeroSection />
        <AboutSection />
      </main>

      {/* Footer */}

    </div>
  )
}