import { useState } from "react";
import { cn } from "./lib/utils";
import { ArrowDown } from "lucide-react";

const skills = {
  frontend: ["React", "Vue", "HTML/CSS", "JavaScript"],
  backend: ["Node.js", "Flask", "GraphQL"],
  tools: ["Git/GitHub", "Docker", "GitLab", "VS Code"],
  certifications: [
    "Microsoft Certified: Azure Fundamentals",
    "GitLab Certified Security Specialist",
    "GitLab Certified CI/CD Associate",
  ],
};

const categories = Object.keys(skills);

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <section id="skills" className="py-32 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        {/* Card wrapper */}
        <div className="bg-card/90 backdrop-blur-md p-12 rounded-3xl shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            My <span className="text-primary">Skills</span>
          </h2>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-5 py-2 rounded-full transition-all duration-300 capitalize font-medium border-2",
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(167,139,250,0.5)]"
                  : "bg-transparent text-muted-foreground border-primary/40 hover:bg-primary/20 hover:text-primary"
              )}
            >
              all
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-5 py-2 rounded-full transition-all duration-300 capitalize font-medium border-2",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(167,139,250,0.5)]"
                    : "bg-transparent text-muted-foreground border-primary/40 hover:bg-primary/20 hover:text-primary"
                )}
              >
                {category}
              </button>
            ))}
          </div>



          {/* Skills Display */}
          <div className="grid gap-12">
            {categories
              .filter(
                (cat) => activeCategory === "all" || activeCategory === cat
              )
              .map((category) => (
                <div key={category} className="text-center">
                  {/* Chips */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {skills[category].map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-secondary/20 text-primary shadow-[0_0_8px_rgba(167,139,250,0.3)]
                                   rounded-full text-sm font-medium cursor-pointer
                                   transition-all duration-300
                                   hover:shadow-[0_0_20px_rgba(167,139,250,0.7)] hover:scale-105"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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
