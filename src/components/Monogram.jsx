import { initials } from "@/lib/format";
import { cn } from "./lib/utils";

/**
 * Placeholder for a missing logo or screenshot. Renders the subject's initials
 * on the site's surface color — visually consistent, and never a broken-image icon.
 */
export const Monogram = ({ name, className, textClassName }) => (
  <div
    className={cn(
      "flex items-center justify-center bg-surface border border-border select-none",
      className
    )}
    role="img"
    aria-label={name}
  >
    <span className={cn("font-semibold text-primary", textClassName)}>
      {initials(name)}
    </span>
  </div>
);
