import { SENTIMENT_COLORS, titleCase } from "../../lib/moodColors";

/**
 * Sentiment polarity — a semantic, always-labeled trio (positive/neutral/negative)
 * as a single proportion bar (2px surface gaps between fills) plus a labeled legend.
 */
export function SentimentSplit({ distribution }: { distribution: Record<string, number> }) {
  const order = ["positive", "neutral", "negative"];
  const total = order.reduce((s, k) => s + (distribution[k] || 0), 0) || 1;

  return (
    <div className="space-y-5">
      {/* proportion bar */}
      <div className="flex h-3 gap-0.5">
        {order.map((k) => {
          const pct = ((distribution[k] || 0) / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={k}
              style={{ width: `${pct}%`, background: SENTIMENT_COLORS[k] }}
              className="h-full"
              title={`${titleCase(k)} ${Math.round(pct)}%`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-3 divide-x divide-rule/12">
        {order.map((k) => {
          const count = distribution[k] || 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={k} className="px-3 text-center first:pl-0 last:pr-0">
              <div className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                <span className="h-2 w-2" style={{ background: SENTIMENT_COLORS[k] }} />
                {titleCase(k)}
              </div>
              <div className="mt-2 font-display text-3xl font-normal tabular-nums text-ink">{pct}%</div>
              <div className="mt-0.5 font-mono text-[10px] text-ink-muted">{count} entries</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
