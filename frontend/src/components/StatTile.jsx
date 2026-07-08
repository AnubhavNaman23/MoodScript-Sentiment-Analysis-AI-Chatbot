import { motion, useReducedMotion } from "framer-motion";

/**
 * Editorial stat cell — an oversized Fraunces figure over a mono label, the way a
 * magazine sets a pull-statistic. Meant to sit inside a ruled grid (see Insights /
 * Dashboard), so it carries no border of its own.
 */
export function StatTile({ label, value, sub, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="font-display text-4xl font-normal tabular-nums leading-none text-ink sm:text-5xl">
        {value}
      </div>
      <div className="mt-2.5 eyebrow">
        {label}
        {sub ? <span className="text-ink-muted/70"> · {sub}</span> : null}
      </div>
    </motion.div>
  );
}
