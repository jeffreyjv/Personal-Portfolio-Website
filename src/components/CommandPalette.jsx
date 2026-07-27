import { useMemo } from "react";
import { Command } from "cmdk";
import {
  ArrowRight,
  Copy,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Moon,
  Phone,
  Sun,
  Tag,
} from "lucide-react";
import projectsData from "@/data/projects.json";
import { navItems } from "@/data/nav";
import { profile } from "@/data/profile";
import { usePortfolioUI, ALL_TAG } from "@/context/portfolio-ui";
import { dedupeTags } from "@/lib/tag-map";

const itemClass =
  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground cursor-pointer " +
  "select-none data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary " +
  "transition-colors duration-100";

const groupClass =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 " +
  "[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold " +
  "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.15em] " +
  "[&_[cmdk-group-heading]]:text-muted";

export default function CommandPalette({ open, onOpenChange }) {
  const { goToSection, toggleTheme, isDark, filterAndScroll } = usePortfolioUI();

  const projects = projectsData.projects;
  const tags = useMemo(
    () => dedupeTags(projects.flatMap((p) => p.tags ?? [])).sort(),
    [projects]
  );

  const run = (fn) => () => {
    onOpenChange(false);
    // Let the dialog close and restore focus before we move the page.
    requestAnimationFrame(fn);
  };

  const copyEmail = run(() => {
    navigator.clipboard?.writeText(profile.email);
  });

  const openUrl = (url, newTab = true) =>
    run(() => window.open(url, newTab ? "_blank" : "_self", "noopener,noreferrer"));

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm
                        data-[state=open]:animate-fade-in"
      contentClassName="fixed z-[101] left-1/2 top-[18vh] w-[min(92vw,560px)] -translate-x-1/2
                        rounded-2xl bg-card border border-border shadow-2xl overflow-hidden
                        data-[state=open]:animate-fade-in"
    >
      <Command.Input
        placeholder="Search or jump to…"
        className="w-full px-5 h-14 bg-transparent outline-none text-foreground
                   placeholder:text-muted border-b border-border text-sm"
      />

      <Command.List className="max-h-[min(60vh,380px)] overflow-y-auto p-2">
        <Command.Empty className="py-8 text-center text-sm text-muted">
          No results.
        </Command.Empty>

        <Command.Group heading="Navigate" className={groupClass}>
          <Command.Item className={itemClass} onSelect={run(() => goToSection("hero"))}>
            <ArrowRight size={15} />
            Top
          </Command.Item>
          {navItems.map((item) => (
            <Command.Item
              key={item.id}
              className={itemClass}
              onSelect={run(() => goToSection(item.id))}
            >
              <ArrowRight size={15} />
              {item.name}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Projects" className={groupClass}>
          {projects.map((p) => (
            <Command.Item
              key={p.slug}
              value={`${p.title} ${(p.tags ?? []).join(" ")}`}
              className={itemClass}
              onSelect={openUrl(`https://github.com/${p.repo}`)}
            >
              <Github size={15} />
              <span className="flex-1">{p.title}</span>
              <span className="text-xs text-muted">Source</span>
            </Command.Item>
          ))}
          {projects
            .filter((p) => p.demoUrl)
            .map((p) => (
              <Command.Item
                key={`${p.slug}-demo`}
                value={`${p.title} live demo`}
                className={itemClass}
                onSelect={openUrl(p.demoUrl)}
              >
                <ExternalLink size={15} />
                <span className="flex-1">{p.title}</span>
                <span className="text-xs text-muted">Live demo</span>
              </Command.Item>
            ))}
        </Command.Group>

        <Command.Group heading="Filter" className={groupClass}>
          <Command.Item
            className={itemClass}
            onSelect={run(() => filterAndScroll(ALL_TAG))}
          >
            <Tag size={15} />
            Show all projects
          </Command.Item>
          {tags.map((tag) => (
            <Command.Item
              key={tag}
              className={itemClass}
              onSelect={run(() => filterAndScroll(tag))}
            >
              <Tag size={15} />
              Show {tag} projects
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Actions" className={groupClass}>
          <Command.Item className={itemClass} onSelect={run(toggleTheme)}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            Switch to {isDark ? "light" : "dark"} mode
          </Command.Item>
          <Command.Item className={itemClass} onSelect={copyEmail}>
            <Copy size={15} />
            Copy email address
          </Command.Item>
          <Command.Item
            className={itemClass}
            onSelect={openUrl(`mailto:${profile.email}`, false)}
          >
            <Mail size={15} />
            Send an email
          </Command.Item>
          <Command.Item className={itemClass} onSelect={openUrl(profile.phoneHref, false)}>
            <Phone size={15} />
            Call {profile.phone}
          </Command.Item>
          <Command.Item className={itemClass} onSelect={openUrl(profile.linkedin)}>
            <Linkedin size={15} />
            Open LinkedIn
          </Command.Item>
          <Command.Item className={itemClass} onSelect={openUrl(profile.github)}>
            <Github size={15} />
            Open GitHub
          </Command.Item>
          <Command.Item className={itemClass} onSelect={openUrl(profile.resume)}>
            <Download size={15} />
            Download résumé
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
