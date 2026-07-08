/** Editorial wordmark — set in Fraunces, with the "Script" half in accent italic. */
export function Logo({ className = "" }) {
  return (
    <span className={`font-display text-xl font-medium tracking-tight text-ink ${className}`}>
      Mood<span className="italic text-accent">Script</span>
    </span>
  );
}
