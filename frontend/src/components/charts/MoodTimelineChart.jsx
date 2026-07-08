import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme, titleCase } from "../../lib/moodColors";
import { useTheme } from "../../store/theme";
import { fmtDate } from "../../lib/format";

/** Single-series mood valence over time — one accent hue, no legend (title names it). */
export function MoodTimelineChart({ data, height = 240 }) {
  const dark = useTheme((s) => s.dark);
  const c = chartTheme(dark);

  if (!data.length) {
    return <div className="py-16 text-center text-sm text-ink-muted">No mood data yet.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.accent} stopOpacity={0.28} />
            <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtDate}
          tick={{ fill: c.axis, fontSize: 11 }}
          minTickGap={44}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[0, 1]} tick={{ fill: c.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
        <Tooltip content={<MoodTooltip c={c} />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke={c.accent}
          strokeWidth={2}
          fill="url(#moodGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: c.accent }}
          name="Mood valence"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MoodTooltip({ active, payload, label, c }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      className="px-3 py-2 font-mono text-[11px]"
      style={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, color: c.ink }}
    >
      <div className="font-semibold">{fmtDate(label)}</div>
      <div style={{ color: c.inkSoft }}>Valence {Math.round(p.score * 100)}%</div>
      <div style={{ color: c.inkMuted }}>Mostly {titleCase(p.label)}</div>
    </div>
  );
}
