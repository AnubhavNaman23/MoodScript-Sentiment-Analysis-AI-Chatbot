import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * The editorial replacement for the old glass card: a hairline-bordered block on
 * the raised paper surface (no blur, no shadow-glow). Reveals gently on scroll.
 */
export function Panel({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`panel ${className}`}
    >
      {children}
    </motion.div>
  );
}
