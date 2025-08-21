import { useState } from "react";
import { ArrowDown, Briefcase, Code, User, ChevronLeft, ChevronRight } from "lucide-react";

export const AboutSection = () => {
  const slides = [
    {
      role: "UNC Chapel Hill - Computer Science Grad",
      description: "B.S. in Computer Science, Minor in Information Systems & Statistics",
      image: "unc.png",
      icon: <Code className="h-6 w-6 text-primary" />,
    },
    {
      role: "Ally Financial - Cloud Engineer",
      description: "Full-stack software engineer on the Cloud Reliability Engineering Team",
      image: "ally.png",
      icon: <Code className="h-6 w-6 text-primary" />,
    },
    {
      role: "Ally Financial - DevSecOps Engineer",
      description:
        "Software engineer on the Enterprise DevSecOps Team focused on cybersecurity & GitLab.",
      image: "ally.png",
      icon: <User className="h-6 w-6 text-primary" />,
    },
    {
      role: "Ally Financial - DevSecOps Intern",
      description: "Intern on the DevSecOps Team where I created the DevSecOps Portal, the beginning of an IDP.",
      image: "ally.png",
      icon: <Briefcase className="h-6 w-6 text-primary" />,
    },
  ];

  const [current, setCurrent] = useState(0);

  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  return (
    <section id="about" className="py-32 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        {/* Main Card */}
        <div className="bg-card p-12 rounded-3xl shadow-xl flex flex-col space-y-12">
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              About <span className="text-primary">Me</span>
            </h2>
          </div>

          {/* Grid: Intro Text + Slideshow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Side: Intro Text */}
            <div className="space-y-6 text-center md:text-left">
              <h3 className="text-2xl font-semibold">
                Hi there! I'm <span className="text-primary font-semibold">Jeffrey Vincent!</span>
              </h3>
              <p className="text-muted-foreground">
                With over <span className="text-primary">2 years of experience</span> in Cloud Engineering, DevSecOps, & Web Development. Majored in Computer Science & Minored in Statistics and Information Systems at the University of North Carolina at Chapel Hill!
              </p>
              <p className="text-muted-foreground">
                I'm passionate about creating elegant solutions to complex problems, and I'm constantly learning new technologies and techniques! In my free time I enjoy travelling and videography!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <a href="#contact" className="cosmic-button">
                  Get In Touch
                </a>
                <a
                  href="/JeffreyVincent-Resume.pdf"
                  download="JeffreyVincent-Resume.pdf"
                  className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
                >
                  Download Resume
                </a>
              </div>
            </div>

            {/* Right Side: Slideshow */}
            <div className="relative">
              <div className="relative p-6 rounded-lg card-hover text-center
                              border-2 border-gradient-to-r from-purple-400 via-pink-500 to-purple-400
                              shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                <img
                  src={slides[current].image}
                  alt={slides[current].role}
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h4 className="font-semibold text-lg">{slides[current].role}</h4>
                </div>
                <p className="text-muted-foreground">{slides[current].description}</p>
              </div>

              {/* Navigation buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-card p-2 rounded-full shadow hover:bg-primary/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-card p-2 rounded-full shadow hover:bg-primary/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-sm text-muted-foreground mb-2"> Scroll </span>
        <ArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
};
