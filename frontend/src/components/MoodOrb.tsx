import { moodColor, titleCase } from "../lib/moodColors";

/**
 * Today's mood, set typographically — a large Fraunces mood word with a small color
 * dot for identity and the valence in mono. Replaces the old glowing gradient orb.
 */
export function MoodOrb({ mood, score }: { mood: string; score: number; size?: number }) {
  const color = moodColor(mood);
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="eyebrow">Today's reading</span>
      </div>
      <div className="mt-4 font-display text-6xl font-normal leading-[0.95] text-ink sm:text-7xl">
        {titleCase(mood)}
      </div>
      <div className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
        valence {Math.round(score * 100)}%
      </div>
    </div>
  );
}
