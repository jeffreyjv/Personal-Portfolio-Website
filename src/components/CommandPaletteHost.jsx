import { Suspense, lazy, useEffect, useState } from "react";

// Kept out of the initial chunk — cmdk + Radix Dialog are never needed on first paint.
const CommandPalette = lazy(() => import("./CommandPalette"));

/**
 * Owns the ⌘K / Ctrl+K shortcut and mounts the palette on first use.
 * Everything else — focus trap, Esc, arrows, focus restore, ARIA — comes from
 * cmdk/Radix and must not be reimplemented here.
 */
export const CommandPaletteHost = ({ open, onOpenChange }) => {
  const [everOpened, setEverOpened] = useState(open);

  useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      const isTyping =
        /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        // Required, or Safari and Firefox hijack this for their own search.
        e.preventDefault();
        onOpenChange(!open);
        return;
      }

      if (e.key === "/" && !open && !isTyping) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!everOpened) return null;

  return (
    <Suspense fallback={null}>
      <CommandPalette open={open} onOpenChange={onOpenChange} />
    </Suspense>
  );
};
