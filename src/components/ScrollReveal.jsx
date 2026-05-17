import { useEffect, useRef } from "react";
import { cn } from "./lib/utils";

export const ScrollReveal = ({ children, className, delay = 0, threshold = 0.12 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add("reveal-visible");
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
};
