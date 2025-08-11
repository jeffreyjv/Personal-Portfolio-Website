import { ArrowDown, Linkedin } from "lucide-react";
import profpic from "../assets/profpic.jpg";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-4"
    >
      <div className="container max-w-4xl mx-auto flex flex-row items-center space-x-8 z-10">
        {/* Image on the left */}
        <div className="flex-shrink-0">
          <img
            src={profpic}
            alt="My Example"
            className="w-48 h-48 rounded-full object-cover"
          />
        </div>

        {/* Text on the right */}
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="opacity-0 animate-fade-in">Hi, I'm</span>
            <span className="text-primary opacity-0 animate-fade-in-delay-1">
              {" "}
              Jeffrey Vincent
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl opacity-0 animate-fade-in-delay-3 mt-4">
            Cloud Engineer, specializing in full-stack development! Enjoy traveling and videography in my free time.
          </p>

          <div className="pt-4 opacity-0 animate-fade-in-delay-4 flex space-x-4">
            <a href="#projects" className="cosmic-button">
              View My Work
            </a>
            <a
              href="https://www.linkedin.com/in/jeffreyvincent-796/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="cosmic-button flex items-center gap-2"
            >
              Connect with me! <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-sm text-muted-foreground mb-2"> Scroll </span>
        <ArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
};
