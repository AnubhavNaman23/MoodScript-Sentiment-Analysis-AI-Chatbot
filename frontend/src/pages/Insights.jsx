import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Panel } from "../components/Panel";
import { StatTile } from "../components/StatTile";
import { Loader } from "../components/Loader";
import { Eyebrow, SectionMarker } from "../components/editorial";
import { MoodTimelineChart } from "../components/charts/MoodTimelineChart";
import { EmotionRadarChart } from "../components/charts/EmotionRadarChart";
import { SentimentSplit } from "../components/charts/SentimentSplit";
import { moodColor, titleCase } from "../lib/moodColors";

export default function Insights() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, m, t] = await Promise.all([
          api.get("/api/stats"),
          api.get("/api/moods/summary"),
          api.get("/api/moods/timeline"),
        ]);
        setStats(s.data);
        setSummary(m.data);
        setTimeline(t.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Crunching your insights…" />;

  const distribution = summary?.distribution || {};
  const maxCount = Math.max(1, ...Object.values(distribution));
  const sortedMoods = Object.entries(distribution).sort((a, b) => b[1] - a[1]);

  const stat = [
    { label: "Entries", value: stats?.totalEntries ?? 0 },
    { label: "Writing streak", value: stats?.writingStreakDays ?? 0, sub: "days" },
    { label: "Average mood", value: `${Math.round((stats?.averageMood ?? 0.5) * 100)}%`, sub: "valence" },
    { label: "Check-ins", value: stats?.totalMoodLogs ?? 0, sub: "readings" },
  ];

  return (
    <div className="space-y-16">
      <header>
        <Eyebrow>The record</Eyebrow>
        <h1 className="mt-3 font-display text-5xl font-normal tracking-tight text-ink sm:text-6xl">Insights</h1>
        <p className="mt-3 max-w-md text-ink-soft">The story your journal tells over time.</p>
      </header>

      {/* stat grid */}
      <section className="grid grid-cols-2 gap-px overflow-hidden border border-rule/15 bg-rule/15 lg:grid-cols-4">
        {stat.map((s, i) => (
          <div key={s.label} className="bg-paper p-6 sm:p-8">
            <StatTile label={s.label} value={s.value} sub={s.sub} delay={i * 0.05} />
          </div>
        ))}
      </section>

      {/* timeline */}
      <section>
        <SectionMarker n={1} label="Mood over the past year" />
        <Panel className="mt-8 p-8">
          <MoodTimelineChart data={timeline} height={300} />
        </Panel>
      </section>

      {/* fingerprint + distribution */}
      <section>
        <SectionMarker n={2} label="Emotions & moods" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel className="p-8">
            <Eyebrow>Emotion fingerprint</Eyebrow>
            <div className="mt-6">
              <EmotionRadarChart distribution={stats?.emotionDistribution || {}} height={280} />
            </div>
          </Panel>

          <Panel className="p-8" delay={0.06}>
            <Eyebrow>Mood distribution</Eyebrow>
            <p className="mb-6 mt-2 text-sm text-ink-muted">How often each mood shows up in your writing.</p>
            <div className="space-y-4">
              {sortedMoods.map(([mood, count]) => (
                <div key={mood}>
                  <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
                    <span className="flex items-center gap-2 text-ink">
                      <span className="h-2 w-2" style={{ background: moodColor(mood) }} />
                      {titleCase(mood)}
                    </span>
                    <span className="text-ink-muted">{count}</span>
                  </div>
                  <div className="h-1.5 bg-rule/12">
                    <div className="h-full" style={{ width: `${(count / maxCount) * 100}%`, background: moodColor(mood) }} />
                  </div>
                </div>
              ))}
              {sortedMoods.length === 0 && <p className="text-sm text-ink-muted">No mood data yet.</p>}
            </div>
          </Panel>
        </div>
      </section>

      {/* sentiment balance */}
      <section>
        <SectionMarker n={3} label="Sentiment balance" />
        <Panel className="mt-8 p-8">
          <p className="mb-8 text-sm text-ink-muted">The overall tone across every entry.</p>
          <SentimentSplit distribution={stats?.sentimentDistribution || {}} />
        </Panel>
      </section>
    </div>
  );
}
