import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { useMoodTint } from "../store/theme";
import { moodColor } from "../lib/moodColors";
import { greeting, fmtLongDate } from "../lib/format";
import { Panel } from "../components/Panel";
import { MoodOrb } from "../components/MoodOrb";
import { StatTile } from "../components/StatTile";
import { EntryCard } from "../components/EntryCard";
import { Loader } from "../components/Loader";
import { Eyebrow, SectionMarker } from "../components/editorial";
import { MoodTimelineChart } from "../components/charts/MoodTimelineChart";
import { EmotionRadarChart } from "../components/charts/EmotionRadarChart";
import { SentimentSplit } from "../components/charts/SentimentSplit";

export default function Dashboard() {
  const user = useAuth((s) => s.user);
  const setTint = useMoodTint((s) => s.setTint);
  const [stats, setStats] = useState(null);
  const [mood, setMood] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, m, e] = await Promise.all([
          api.get("/api/stats"),
          api.get("/api/moods/summary"),
          api.get("/api/entries?page=0&size=5"),
        ]);
        if (!active) return;
        setStats(s.data);
        setMood(m.data);
        setRecent(e.data.items);
        setTint(moodColor(m.data.currentMood));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      setTint(null);
    };
  }, [setTint]);

  if (loading) return <Loader label="Setting the issue…" />;

  const stat = [
    { label: "Entries", value: stats?.totalEntries ?? 0 },
    { label: "Writing streak", value: stats?.writingStreakDays ?? 0, sub: "days" },
    { label: "Average mood", value: `${Math.round((stats?.averageMood ?? 0.5) * 100)}%`, sub: "valence" },
    { label: "Check-ins", value: stats?.totalMoodLogs ?? 0, sub: "readings" },
  ];

  return (
    <div className="space-y-16">
      {/* masthead */}
      <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>{greeting()} · {fmtLongDate(new Date().toISOString())}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl font-normal tracking-tight text-ink sm:text-6xl">
            {user?.displayName}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/app/journal" className="btn-primary">New entry</Link>
          <Link to="/app/chat" className="link-underline text-sm">Talk to Rant AI →</Link>
        </div>
      </header>

      {/* today's reading + timeline */}
      <section className="grid gap-px overflow-hidden border border-rule/15 bg-rule/15 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-paper p-8">
          <MoodOrb mood={mood?.currentMood || "neutral"} score={mood?.currentScore ?? 0.5} />
          <p className="mt-8 max-w-xs text-sm leading-relaxed text-ink-soft">
            Your latest mood, read straight from what you've been writing.
          </p>
        </div>
        <div className="bg-paper p-8">
          <div className="mb-4 flex items-baseline justify-between">
            <Eyebrow>Mood over time</Eyebrow>
            <Link to="/app/insights" className="link-underline text-xs">Insights →</Link>
          </div>
          <MoodTimelineChart data={mood?.recent || []} height={230} />
        </div>
      </section>

      {/* stat grid */}
      <section className="grid grid-cols-2 gap-px overflow-hidden border border-rule/15 bg-rule/15 lg:grid-cols-4">
        {stat.map((s, i) => (
          <div key={s.label} className="bg-paper p-6 sm:p-8">
            <StatTile label={s.label} value={s.value} sub={s.sub} delay={i * 0.05} />
          </div>
        ))}
      </section>

      {/* fingerprint + balance */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-8">
          <Eyebrow>Emotion fingerprint</Eyebrow>
          <p className="mb-4 mt-2 text-sm text-ink-muted">How your entries distribute across emotions.</p>
          <EmotionRadarChart distribution={stats?.emotionDistribution || {}} />
        </Panel>
        <Panel className="p-8" delay={0.06}>
          <Eyebrow>Sentiment balance</Eyebrow>
          <p className="mb-6 mt-2 text-sm text-ink-muted">The overall tone of everything you've written.</p>
          <SentimentSplit distribution={stats?.sentimentDistribution || {}} />
        </Panel>
      </section>

      {/* recent entries */}
      <section>
        <div className="flex items-baseline justify-between">
          <SectionMarker n={5} label="Recent entries" />
          <Link to="/app/journal" className="link-underline text-xs">All entries →</Link>
        </div>
        {recent.length === 0 ? (
          <Panel className="mt-8 p-10 text-center">
            <p className="text-ink-soft">No entries yet. Start with your first one.</p>
            <Link to="/app/journal" className="btn-primary mt-6 inline-flex">Write an entry</Link>
          </Panel>
        ) : (
          <div className="mt-8 border-t border-rule/15">
            <div className="divide-y divide-rule/12">
              {recent.map((e, i) => (
                <EntryCard key={e.id} entry={e} index={i} delay={i * 0.05} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
