import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { chartTheme, titleCase } from "../../lib/moodColors";
import { useTheme } from "../../store/theme";

/** Single-series emotion distribution — one accent hue fill, categories on the axis. */
export function EmotionRadarChart({
  distribution,
  height = 260,
}: {
  distribution: Record<string, number>;
  height?: number;
}) {
  const dark = useTheme((s) => s.dark);
  const c = chartTheme(dark);

  const entries = Object.entries(distribution || {});
  if (!entries.length) {
    return <div className="py-16 text-center text-sm text-ink-muted">No emotions detected yet.</div>;
  }
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const data = entries
    .map(([emotion, count]) => ({ emotion: titleCase(emotion), value: Math.round((count / total) * 100) }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={c.grid} />
        <PolarAngleAxis dataKey="emotion" tick={{ fill: c.axis, fontSize: 11 }} />
        <Radar
          dataKey="value"
          stroke={c.accent}
          strokeWidth={2}
          fill={c.accent}
          fillOpacity={0.22}
          name="Share of entries"
        />
        <Tooltip content={<RadarTip c={c} />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function RadarTip({ active, payload, c }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      className="px-3 py-2 font-mono text-[11px]"
      style={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, color: c.ink }}
    >
      <span className="font-semibold">{p.emotion}</span>
      <span style={{ color: c.inkSoft }}> · {p.value}% of entries</span>
    </div>
  );
}
