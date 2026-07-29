import {
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
import { useHasFinePointer } from "./use-media-query";

/**
 * A soft primary-tinted glow that follows the cursor inside a card.
 *
 * The position lives in motion values, never React state: a `useState` here
 * would re-render the card on every pointermove, and with four cards on screen
 * that's a re-render storm for a purely visual effect. Motion writes the
 * `background` straight to the DOM node instead, outside React's render cycle.
 *
 * `enabled` is false on touch (no cursor to follow) and under reduced motion —
 * `<MotionConfig reducedMotion="user">` in App.jsx only covers variants and
 * `animate`, not values driven by an event handler like this one.
 *
 * Usage: spread `handlers` on the card, and render `background` on an inset,
 * pointer-events-none overlay behind the content.
 */
export function usePointerSpotlight({ size = 260, alpha = 0.14 } = {}) {
  const reduced = useReducedMotion();
  const finePointer = useHasFinePointer();
  const enabled = finePointer && !reduced;

  // Parked far off the card so the first paint has no glow sitting at 0,0.
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);

  // `circle <len> at` — not `<len> circle at`, which Chrome silently tolerates
  // and other engines drop on the floor.
  const background = useMotionTemplate`radial-gradient(circle ${size}px at ${x}px ${y}px, hsl(var(--primary) / ${alpha}), transparent 70%)`;

  const handlers = enabled
    ? {
        onPointerMove: (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - rect.left);
          y.set(e.clientY - rect.top);
        },
        onPointerLeave: () => {
          x.set(-9999);
          y.set(-9999);
        },
      }
    : {};

  return { enabled, background, handlers };
}
