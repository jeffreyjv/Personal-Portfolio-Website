import { ThemeToggle } from "../components/ThemeToggle"
import { Navbar } from "../components/Navbar.jsx";

export const Home = () => {
  return (
    <div className="min-h-dvh bg-background text--foreground overflow-x-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Navbar */}
      <Navbar />
      {/* Main Content */}

      {/* Footer */}

    </div>
  )
}