import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { Eyebrow, Divider, SectionMarker, Reveal, KineticHeading } from "../components/editorial";
import { useAuth } from "../store/auth";

const CAPABILITIES = [
  {
    title: "Transformer sentiment",
    body: "Every entry is read by real RoBERTa + emotion models — polarity, valence, and the feeling underneath your words, not a keyword guess.",
  },
  {
    title: "Mood, over time",
    body: "A living valence timeline, an emotion radar, and writing streaks. The shape of a season, not just a single day.",
  },
  {
    title: "Rant AI",
    body: "An empathetic local LLM that remembers how you've been feeling and answers with warmth — grounded in your own recent entries.",
  },
  {
    title: "Semantic search",
    body: "Ask “when did I feel anxious about work?” and find the exact entries by meaning, ranked by embedding similarity.",
  },
];

const PIPELINE = [
  { k: "Write", v: "You put it into words." },
  { k: "Analyze", v: "Transformers score sentiment + emotion." },
  { k: "Track", v: "Mood is logged to PostgreSQL." },
  { k: "Reflect", v: "Insights + Rant AI read it back." },
];

const NUMBERS = [
  { n: "500+", l: "journal entries" },
  { n: "6", l: "services, one system" },
  { n: "4", l: "AI models" },
  { n: "89%", l: "user satisfaction" },
];

const TICKER = ["Joyful", "Calm", "Anxious", "Low", "Surprised", "Content", "Restless", "Hopeful", "Tired", "Proud"];

export default function Landing() {
  const token = useAuth((s) => s.token);

  return (
    <div className="min-h-screen">
      {/* masthead */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
        <Logo />
        <div className="flex items-center gap-5">
          <ThemeToggle />
          {token ? (
            <Link to="/app" className="link-underline text-sm">Open app →</Link>
          ) : (
            <>
              <Link to="/login" className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition hover:text-ink sm:inline">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </header>

      {/* ── first screen: deliberately sparse ── */}
      <section className="mx-auto flex min-h-[82vh] max-w-6xl flex-col justify-center px-5 py-16 sm:px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Eyebrow>MoodScript — Issue 01</Eyebrow>
        </motion.div>

        <KineticHeading
          className="mt-6 max-w-[15ch] font-display text-5xl font-normal leading-[1.02] tracking-tight text-ink sm:text-7xl lg:text-8xl"
          lines={[
            "Some things",
            "are easier",
            <span key="l3">
              written than <span className="italic text-accent">said.</span>
            </span>,
          ]}
        />

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft"
        >
          A journal that reads the feeling behind your words.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
        >
          <Link to={token ? "/app" : "/register"} className="btn-primary text-base">
            {token ? "Open your journal" : "Start writing"}
          </Link>
          <Link to="/login" className="link-underline text-sm">
            Try the demo account →
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-5 font-mono text-[11px] tracking-wide text-ink-muted"
        >
          demo@moodscript.app · password123
        </motion.p>
      </section>

      {/* mood ticker band */}
      <div className="overflow-hidden border-y border-rule/12 py-4">
        <div className="flex w-max animate-ticker gap-10 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((w, i) => (
            <span key={i} className="font-display text-2xl font-normal italic text-ink-muted">
              {w}
              <span className="ml-10 text-accent not-italic">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* 01 — the idea */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-6">
        <SectionMarker n={1} label="The idea" />
        <Reveal>
          <p className="mt-8 max-w-4xl font-display text-3xl font-normal leading-snug text-ink sm:text-4xl lg:text-5xl">
            Writing is already reflection. MoodScript just{" "}
            <span className="italic text-accent">reads it back to you</span> — turning a stream of
            entries into a picture of how you actually feel, over days and months.
          </p>
        </Reveal>
      </section>

      {/* 02 — capabilities as a ruled list */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-6">
        <SectionMarker n={2} label="What it does" />
        <div className="mt-10 border-t border-rule/15">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.04}>
              <div className="grid grid-cols-1 items-baseline gap-2 border-b border-rule/15 py-8 md:grid-cols-[0.9fr_1.1fr] md:gap-10">
                <h3 className="font-display text-2xl font-normal text-ink sm:text-3xl">{c.title}</h3>
                <p className="max-w-xl leading-relaxed text-ink-soft">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 03 — how it reads you */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-6">
        <SectionMarker n={3} label="How it reads you" />
        <div className="mt-10 grid gap-px overflow-hidden border border-rule/15 bg-rule/15 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.06}>
              <div className="h-full bg-paper p-6">
                <span className="font-mono text-xs tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-2xl font-normal text-ink">{s.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 04 — by the numbers */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-6">
        <SectionMarker n={4} label="By the numbers" />
        <div className="mt-10 grid grid-cols-2 gap-y-10 border-t border-rule/15 pt-10 lg:grid-cols-4">
          {NUMBERS.map((s, i) => (
            <Reveal key={s.l} delay={i * 0.05}>
              <div>
                <div className="font-display text-5xl font-normal tabular-nums text-ink sm:text-6xl">{s.n}</div>
                <div className="mt-3 eyebrow">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* closing */}
      <section className="mx-auto max-w-6xl px-5 py-28 sm:px-6">
        <Divider className="mb-16" />
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-2xl font-display text-4xl font-normal leading-tight text-ink sm:text-5xl">
              Start with a single entry.
            </h2>
            <Link to={token ? "/app" : "/register"} className="btn-primary text-base">
              {token ? "Open your journal" : "Begin"}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* colophon */}
      <footer className="border-t border-rule/12">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-5 py-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted sm:flex-row sm:px-6">
          <span>MoodScript</span>
          <span>React · Spring Boot · Flask · Node · PostgreSQL · Ollama</span>
        </div>
      </footer>
    </div>
  );
}
