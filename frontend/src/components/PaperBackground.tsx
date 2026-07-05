/**
 * Quiet "paper" backdrop — a still, fine grain over the paper surface (no drifting
 * blobs, no glass). Uses an inline SVG fractal-noise texture as a data URI so there
 * are no external requests. Deliberately near-invisible: it's texture, not decoration.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function PaperBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-paper" />
      {/* grain — multiply on paper, screen on ink, both very faint */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
        style={{ backgroundImage: NOISE, backgroundSize: "140px 140px" }}
      />
      {/* a whisper of warmth pooled at the top, so the page isn't dead-flat */}
      <div className="absolute inset-x-0 top-0 h-[45vh] bg-gradient-to-b from-accent/[0.04] to-transparent" />
    </div>
  );
}
