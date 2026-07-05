import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import type { Entry } from "../lib/types";
import { moodColor, titleCase } from "../lib/moodColors";
import { relativeTime } from "../lib/format";

/**
 * An indexed, ruled entry row — the way a magazine sets a table of contents:
 * a mono index number, a Fraunces title, a one-line excerpt, and a mono meta line
 * (mood dot + label + relative time). Meant to live inside a `divide-y` list.
 */
export function EntryCard({
  entry,
  index = 0,
  delay = 0,
  score,
}: {
  entry: Entry;
  index?: number;
  delay?: number;
  score?: number;
}) {
  const reduce = useReducedMotion();
  const mood = entry.sentiment?.moodLabel || "neutral";
  const color = moodColor(mood);

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/app/journal/${entry.id}`}
        className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-5 sm:gap-6"
      >
        <span className="font-mono text-xs tabular-nums text-ink-muted">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0">
          <h3 className="truncate font-display text-xl font-normal text-ink transition-colors group-hover:text-accent sm:text-2xl">
            {entry.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{entry.body}</p>
          <div className="mt-2.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            <span className="inline-block h-1.5 w-1.5" style={{ background: color }} />
            {titleCase(mood)}
            <span className="text-ink-muted/60">·</span>
            {relativeTime(entry.createdAt)}
            {typeof score === "number" && score > 0 && (
              <>
                <span className="text-ink-muted/60">·</span>
                <span className="text-accent">{Math.round(score * 100)}% match</span>
              </>
            )}
          </div>
        </div>

        <span className="translate-x-0 text-ink-muted transition-all group-hover:translate-x-1 group-hover:text-accent">
          →
        </span>
      </Link>
    </motion.div>
  );
}
