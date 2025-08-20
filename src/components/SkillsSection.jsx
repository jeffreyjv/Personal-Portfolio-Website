import { useState } from "react";
import { cn } from "./lib/utils";

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
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          My <span className="text-primary">Skills</span>
        </h2>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/70 hover:bg-secondary"
            )}
          >
            all
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 hover:bg-secondary"
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
                      className="px-4 py-2 bg-card shadow-sm rounded-full text-sm font-medium transition-all duration-300 cursor-pointer
                                 hover:bg-primary/20 hover:text-primary hover:shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
