import { SENTIMENT_COLORS, moodColor } from "../lib/moodColors";

/**
 * Editorial sentiment tag — a small square color tick + a mono label (identity is
 * never carried by color alone). The primary emotion trails as a muted mono note.
 */
export function SentimentBadge({ sentiment }) {
  if (!sentiment) {
    return <span className="eyebrow text-ink-muted">analyzing…</span>;
  }
  const color = SENTIMENT_COLORS[sentiment.label] || "#8A8377";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
      <span className="h-2 w-2" style={{ background: color }} />
      <span className="text-ink">{sentiment.label}</span>
      {sentiment.primaryEmotion && (
        <span className="text-ink-muted" style={{ color: moodColor(sentiment.moodLabel) }}>
          / {sentiment.primaryEmotion}
        </span>
      )}
    </span>
  );
}
