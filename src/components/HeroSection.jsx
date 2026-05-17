import { ArrowDown, Linkedin } from "lucide-react";
import profpic from "../assets/profpic.jpg";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-12 text-center"
    >
      {/* Profile photo */}
      <div className="opacity-0 animate-[fade-in_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards] mb-8">
        <div className="relative w-28 h-28 mx-auto">
          <img
            src={profpic}
            alt="Jeffrey Vincent"
            className="w-full h-full rounded-full object-cover ring-4 ring-border shadow-xl"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full ring-2 ring-background" />
        </div>
      </div>

      {/* Eyebrow */}
      <p
        className="opacity-0 animate-[fade-in_0.9s_cubic-bezier(0.16,1,0.3,1)_0.15s_forwards]
                   text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-4"
      >
        Cloud Engineer &amp; Full-Stack Developer
      </p>

      {/* Headline */}
      <h1
        className="opacity-0 animate-[fade-in_0.9s_cubic-bezier(0.16,1,0.3,1)_0.3s_forwards]
                   text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-none mb-6"
      >
        Hi, I'm{" "}
        <span className="text-primary">Jeffrey</span>
        <br />
        <span className="text-primary">Vincent.</span>
      </h1>

      {/* Subtext */}
      <p
        className="opacity-0 animate-[fade-in_0.9s_cubic-bezier(0.16,1,0.3,1)_0.45s_forwards]
                   text-lg md:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed"
      >
        Building cloud-native solutions and elegant interfaces. Based in Charlotte, NC.
        Exploring the world through travel and videography on the side.
      </p>

      {/* CTAs */}
      <div className="opacity-0 animate-[fade-in_0.9s_cubic-bezier(0.16,1,0.3,1)_0.6s_forwards] flex flex-wrap gap-3 justify-center">
        <a href="#projects" className="apple-btn-primary">
          View My Work
        </a>
        <a
          href="https://www.linkedin.com/in/jeffreyvincent-796/"
          target="_blank"
          rel="noopener noreferrer"
          className="apple-btn-secondary"
        >
          <Linkedin size={15} />
          LinkedIn
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-[fade-in_0.9s_cubic-bezier(0.16,1,0.3,1)_1s_forwards]">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Scroll</span>
        <ArrowDown className="h-4 w-4 text-muted animate-bounce" />
      </div>
    </section>
  );
};
