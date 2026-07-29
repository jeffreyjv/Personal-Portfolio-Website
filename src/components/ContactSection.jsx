import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RevealText } from "./RevealText";
import { profile } from "@/data/profile";
import { DUR, EASE, SPRING, VIEWPORT, fadeUp, staggerContainer } from "@/lib/motion";
import { useSectionScroll } from "@/hooks/use-section-scroll";
import { useIsDesktop } from "@/hooks/use-media-query";
import { usePointerSpotlight } from "@/hooks/use-pointer-spotlight";

/** `https://github.com/jeffreyjv` → `jeffreyjv`. Keeps the handles in one place
    (src/data/profile.js) instead of spelling them out a second time here. */
const handle = (url) => url.replace(/\/+$/, "").split("/").pop();

/* Every value comes from profile.js — this used to hold its own copy of the
   email and phone number, which meant the palette and this section could drift. */
const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    copy: profile.email,
  },
  {
    icon: Phone,
    label: "Phone",
    value: profile.phone,
    href: profile.phoneHref,
    copy: profile.phone,
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: `in/${handle(profile.linkedin)}`,
    href: profile.linkedin,
    external: true,
  },
  {
    icon: Github,
    label: "GitHub",
    value: `@${handle(profile.github)}`,
    href: profile.github,
    external: true,
  },
];

/* Two slow gradient washes inside the panel, on the same non-harmonic-duration
   trick as StarBackground so they never re-sync into one visible pulse. */
const AURORA = [
  {
    className: "-top-24 -left-16 w-[420px] h-[420px]",
    color: "hsl(211 100% 60%)",
    duration: 19,
    x: [0, 40, -24, 0],
    y: [0, 26, -18, 0],
  },
  {
    className: "-bottom-32 -right-10 w-[380px] h-[380px]",
    color: "hsl(280 80% 65%)",
    duration: 25,
    x: [0, -34, 22, 0],
    y: [0, -20, 16, 0],
  },
];

/** Dot with an expanding ring — the one thing on the page that says "now". */
const StatusDot = () => {
  const reduced = useReducedMotion();

  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {/* The ring is a second element rather than an `animate-ping` class:
          MotionConfig can't switch a CSS animation off for reduced motion. */}
      {!reduced && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-emerald-500"
          animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
};

/**
 * One contact channel.
 *
 * The row is a `<li>`, not an `<a>`: the copy button has to live outside the
 * link (a button inside an anchor is invalid, and the click would open the
 * mail client on its way through). The anchor stretches over the whole row with
 * `after:inset-0` instead, and the button sits above it on `z-10`.
 */
const ChannelRow = ({ channel, copied, onCopy }) => {
  const isCopied = copied === channel.copy;

  return (
    <motion.li
      variants={fadeUp}
      whileHover={{ x: 4 }}
      transition={SPRING.hover}
      className="group relative flex items-center gap-4 rounded-2xl border border-border
                 bg-surface/60 p-4 transition-colors duration-300
                 hover:border-primary/40 hover:bg-primary/[0.06]"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                   border border-border bg-card text-primary transition-colors duration-300
                   group-hover:border-primary group-hover:bg-primary
                   group-hover:text-primary-foreground"
      >
        <channel.icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          {channel.label}
        </p>
        <a
          href={channel.href}
          {...(channel.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="block truncate text-sm text-foreground transition-colors
                     after:absolute after:inset-0 after:rounded-2xl group-hover:text-primary"
        >
          {channel.value}
        </a>
      </div>

      <span className="ml-auto flex shrink-0 items-center gap-1 pl-2">
        {channel.copy && (
          <button
            type="button"
            onClick={() => onCopy(channel.copy)}
            aria-label={`Copy ${channel.label.toLowerCase()}`}
            className="relative z-10 grid h-8 w-8 place-items-center rounded-lg text-muted
                       transition-colors hover:bg-border/60 hover:text-foreground cursor-pointer"
          >
            {/* mode="wait" so the two icons never overlap in the 32px box. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isCopied ? "check" : "copy"}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: DUR.xs, ease: EASE }}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 text-muted opacity-0 transition-all duration-300
                     group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                     group-hover:text-primary group-hover:opacity-100"
        />
      </span>

      {/* Announced instead of the icon swap, which is aria-hidden decoration. */}
      <span className="sr-only" role="status">
        {isCopied ? `${channel.label} copied to clipboard` : ""}
      </span>
    </motion.li>
  );
};

export const ContactSection = () => {
  const sectionRef = useRef(null);
  const { y, scale } = useSectionScroll(sectionRef);
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // Same gate as StarBackground: these are 400px blurred gradients, and
  // animating them on a phone is the page's biggest compositing cost.
  const drift = !reduced && isDesktop;

  // One spotlight for the whole panel rather than per-row — the panel is the
  // object being lit, and four spotlights would fight at the row boundaries.
  const { enabled: spotlit, background, handlers } = usePointerSpotlight({
    size: 460,
    alpha: 0.1,
  });

  const [copied, setCopied] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1800);
  };

  return (
    <section ref={sectionRef} id="contact" className="section-page">
      <motion.div className="section-shell" style={{ y, scale }}>
        <motion.div
          {...handlers}
          // Inline radius, not `rounded-3xl` — see CLAUDE.md: Motion has to own
          // a radius it may counter-distort while the section scrub scales it.
          style={{ borderRadius: 28 }}
          className="relative isolate overflow-hidden border border-border bg-card
                     p-8 sm:p-10 lg:p-14 shadow-sm"
        >
          {/* Ambient layers. Both are inert and sit under the content, which
              carries its own stacking context via `relative`. */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-60 dark:opacity-40">
            {AURORA.map((orb, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full blur-3xl ${orb.className}`}
                style={{
                  background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                  opacity: 0.22,
                }}
                animate={drift ? { x: orb.x, y: orb.y, scale: [1, 1.08, 0.96, 1] } : undefined}
                transition={
                  drift
                    ? {
                        duration: orb.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.33, 0.66, 1],
                      }
                    : undefined
                }
              />
            ))}
          </div>

          {spotlit && (
            <motion.div
              aria-hidden="true"
              style={{ background }}
              className="absolute inset-0 -z-10 pointer-events-none"
            />
          )}

          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            {/* Left — the pitch */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: DUR.md, ease: EASE }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-border
                           bg-surface/70 px-3 py-1.5 text-[10px] font-semibold uppercase
                           tracking-[0.16em] text-muted backdrop-blur-sm"
              >
                <StatusDot />
                Open to new opportunities
              </motion.p>

              <RevealText className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Let's Connect
              </RevealText>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: DUR.lg, ease: EASE, delay: 0.1 }}
                className="mt-5 max-w-md text-base leading-relaxed text-muted"
              >
                Always up for new opportunities, collaborations, or just a good
                conversation about cloud, code and everything between.
              </motion.p>

              <motion.div
                variants={staggerContainer(0.08, 0.18)}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                className="mt-8 flex flex-wrap gap-3"
              >
                <motion.a
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING.hover}
                  href={`mailto:${profile.email}`}
                  className="apple-btn-primary"
                >
                  <Mail size={15} />
                  Send an email
                </motion.a>
                <motion.a
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING.hover}
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apple-btn-secondary"
                >
                  Résumé
                </motion.a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: DUR.md, ease: EASE, delay: 0.3 }}
                className="mt-8 flex items-center gap-2 text-sm text-muted"
              >
                <MapPin className="h-4 w-4 text-primary" />
                {profile.location}
                <span aria-hidden="true">·</span>
                Remote friendly
              </motion.p>
            </div>

            {/* Right — the channels. Stagger lives on the <ul> rather than a
                ScrollReveal per row: real stagger, four fewer wrapper divs. */}
            <motion.ul
              variants={staggerContainer(0.09, 0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="flex flex-col gap-3 lg:self-center"
            >
              {CHANNELS.map((channel) => (
                <ChannelRow
                  key={channel.label}
                  channel={channel}
                  copied={copied}
                  onCopy={onCopy}
                />
              ))}
            </motion.ul>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
