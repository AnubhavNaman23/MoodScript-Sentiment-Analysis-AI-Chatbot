import { motion, useReducedMotion } from "framer-motion";

/**
 * Shared "Editorial Ink" atoms — the vocabulary every page composes from:
 * mono eyebrows, hairline rules, numbered section markers, scroll reveals,
 * and the kinetic masked headline. All motion honors prefers-reduced-motion.
 */

const EASE = [0.22, 1, 0.36, 1];

export function Eyebrow({ children, className = "" }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

/** Hairline rule that draws in from the left when scrolled into view. */
export function Divider({ className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.hr
      aria-hidden
      className={`origin-left border-0 border-t border-rule/15 ${className}`}
      initial={reduce ? undefined : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: EASE }}
    />
  );
}

/** "01 — LABEL" section marker in mono. */
export function SectionMarker({ n, label, className = "" }) {
  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <span className="font-mono text-xs tabular-nums text-accent">{String(n).padStart(2, "0")}</span>
      {label && <span className="eyebrow">{label}</span>}
    </div>
  );
}

/** Fade + rise on scroll-into-view. */
export function Reveal({ children, delay = 0, y = 20, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Big headline whose lines rise from behind a mask, one after another, on load. */
export function KineticHeading({ lines, className = "", as: Tag = "h1", start = 0.1, stagger = 0.11 }) {
  const reduce = useReducedMotion();
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            initial={reduce ? undefined : { y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: start + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
