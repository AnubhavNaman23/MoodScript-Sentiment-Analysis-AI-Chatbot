import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { api, apiError } from "../lib/api";
import { EntryCard } from "../components/EntryCard";
import { SentimentBadge } from "../components/SentimentBadge";
import { Loader } from "../components/Loader";
import { Eyebrow } from "../components/editorial";
import type { Entry, EntryPage, SearchHit } from "../lib/types";

const PAGE_SIZE = 10;

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [justSaved, setJustSaved] = useState<Entry | null>(null);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchHit[] | null>(null);

  const loadPage = async (p: number) => {
    const { data } = await api.get<EntryPage>(`/api/entries?page=${p}&size=${PAGE_SIZE}`);
    setTotal(data.total);
    setEntries((prev) => (p === 0 ? data.items : [...prev, ...data.items]));
  };

  useEffect(() => {
    loadPage(0).finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const { data } = await api.post<Entry>("/api/entries", { title, body });
      setEntries((prev) => [data, ...prev]);
      setTotal((t) => t + 1);
      setJustSaved(data);
      setTitle("");
      setBody("");
      setTimeout(() => setJustSaved(null), 6000);
    } catch (err) {
      setSaveError(apiError(err, "Could not save entry."));
    } finally {
      setSaving(false);
    }
  };

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { data } = await api.get<SearchHit[]>(`/api/entries/search?q=${encodeURIComponent(query)}`);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const next = page + 1;
    await loadPage(next);
    setPage(next);
    setLoadingMore(false);
  };

  return (
    <div className="space-y-14">
      <header>
        <Eyebrow>The desk</Eyebrow>
        <h1 className="mt-3 font-display text-5xl font-normal tracking-tight text-ink sm:text-6xl">Journal</h1>
        <p className="mt-3 max-w-md text-ink-soft">Write freely. MoodScript reads the feeling behind your words.</p>
      </header>

      {/* composer — writing on paper */}
      <section className="border-y border-rule/15 py-8">
        <form onSubmit={save}>
          <input
            className="w-full bg-transparent font-display text-3xl font-normal text-ink outline-none placeholder:text-ink-muted/60"
            placeholder="A title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <textarea
            className="mt-5 min-h-[180px] w-full resize-y bg-transparent font-display text-lg leading-relaxed text-ink-soft outline-none placeholder:text-ink-muted/60"
            placeholder="What's on your mind today?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {saveError && <p className="font-mono text-xs text-[#C4432B]">{saveError}</p>}
          <div className="mt-4 flex items-center justify-between border-t border-rule/12 pt-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              {body.length} characters
            </span>
            <button type="submit" disabled={saving || !title.trim() || !body.trim()} className="btn-primary">
              {saving ? (<><Loader2 size={15} className="animate-spin" /> Analyzing…</>) : "Save entry"}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {justSaved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex flex-wrap items-center gap-3 overflow-hidden border-l-2 border-accent bg-accent/[0.05] px-4 py-3"
            >
              <span className="eyebrow">Saved &amp; analyzed</span>
              <SentimentBadge sentiment={justSaved.sentiment} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* search */}
      <form onSubmit={runSearch} className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="input pl-7"
            placeholder='Search by meaning — e.g. "when I felt anxious about work"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results !== null && (
            <button type="button" onClick={clearSearch} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-accent">
              <X size={15} />
            </button>
          )}
        </div>
        <button type="submit" disabled={searching} className="btn-ghost">
          {searching ? <Loader2 size={15} className="animate-spin" /> : "Search"}
        </button>
      </form>

      {/* results or list */}
      {loading ? (
        <Loader label="Loading entries…" />
      ) : results !== null ? (
        <section>
          <Eyebrow>
            {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
          </Eyebrow>
          {results.length === 0 ? (
            <p className="mt-8 text-ink-soft">No matching entries found.</p>
          ) : (
            <div className="mt-6 border-t border-rule/15">
              <div className="divide-y divide-rule/12">
                {results.map((hit, i) => (
                  <EntryCard key={hit.entry.id} entry={hit.entry} index={i} delay={i * 0.04} score={hit.score} />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section>
          <Eyebrow>All entries · {total}</Eyebrow>
          <div className="mt-6 border-t border-rule/15">
            <div className="divide-y divide-rule/12">
              {entries.map((e, i) => (
                <EntryCard key={e.id} entry={e} index={i} delay={Math.min(i, 8) * 0.04} />
              ))}
            </div>
          </div>
          {entries.length < total && (
            <div className="mt-10 flex justify-center">
              <button onClick={loadMore} disabled={loadingMore} className="btn-ghost">
                {loadingMore ? <Loader2 size={15} className="animate-spin" /> : "Load more"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
