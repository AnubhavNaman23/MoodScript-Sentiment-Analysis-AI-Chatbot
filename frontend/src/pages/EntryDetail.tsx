import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { api, apiError } from "../lib/api";
import { SentimentBadge } from "../components/SentimentBadge";
import { Loader } from "../components/Loader";
import { Eyebrow } from "../components/editorial";
import { EmotionRadarChart } from "../components/charts/EmotionRadarChart";
import { SENTIMENT_COLORS } from "../lib/moodColors";
import { fmtLongDate } from "../lib/format";
import type { Entry } from "../lib/types";

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Entry>(`/api/entries/${id}`);
        setEntry(data);
        setTitle(data.title);
        setBody(data.body);
      } catch (e) {
        setError(apiError(e, "Entry not found."));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put<Entry>(`/api/entries/${id}`, { title, body });
      setEntry(data);
      setEditing(false);
    } catch (e) {
      setError(apiError(e, "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    await api.delete(`/api/entries/${id}`);
    navigate("/app/journal");
  };

  if (loading) return <Loader label="Loading entry…" />;
  if (!entry) return <div className="py-20 text-center text-ink-soft">{error || "Entry not found."}</div>;

  const s = entry.sentiment;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <Link to="/app/journal" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition hover:text-ink">
          <ArrowLeft size={14} /> Back to journal
        </Link>
        <div className="flex items-center gap-5">
          {!editing && (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition hover:text-ink">
              <Pencil size={13} /> Edit
            </button>
          )}
          <button onClick={remove} className="text-ink-muted transition hover:text-[#C4432B]" title="Delete entry">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-10 space-y-5">
          <input
            className="w-full bg-transparent font-display text-4xl font-normal text-ink outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="field min-h-[280px] resize-y font-display text-lg leading-relaxed"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {error && <p className="font-mono text-xs text-[#C4432B]">{error}</p>}
          <div className="flex justify-end gap-4">
            <button onClick={() => { setEditing(false); setTitle(entry.title); setBody(entry.body); }} className="btn-ghost">
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Re-analyzing…</> : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <article className="mt-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            {fmtLongDate(entry.createdAt)}
          </div>
          <h1 className="mt-4 font-display text-4xl font-normal leading-[1.1] tracking-tight text-ink sm:text-5xl">
            {entry.title}
          </h1>
          <div className="mt-5 border-y border-rule/12 py-3">
            <SentimentBadge sentiment={s} />
          </div>
          <p className="mt-8 whitespace-pre-wrap font-display text-lg leading-[1.85] text-ink-soft">
            {entry.body}
          </p>
        </article>
      )}

      {s && !editing && (
        <div className="mt-16 grid gap-px overflow-hidden border border-rule/15 bg-rule/15 md:grid-cols-2">
          {/* sentiment breakdown */}
          <div className="bg-paper p-8">
            <Eyebrow>Sentiment breakdown</Eyebrow>
            <div className="mt-6 space-y-4">
              {[
                { k: "positive", label: "Positive", v: s.pos },
                { k: "neutral", label: "Neutral", v: s.neu },
                { k: "negative", label: "Negative", v: s.neg },
              ].map((row) => (
                <div key={row.k}>
                  <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    <span>{row.label}</span>
                    <span>{Math.round(row.v * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-rule/12">
                    <div className="h-full" style={{ width: `${Math.round(row.v * 100)}%`, background: SENTIMENT_COLORS[row.k] }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-baseline justify-between border-t border-rule/12 pt-4">
              <span className="eyebrow">Compound valence</span>
              <span className="font-display text-2xl font-normal tabular-nums text-ink">{s.compound.toFixed(2)}</span>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Model: {s.emotionScores ? "roberta + distilroberta" : "—"}
            </p>
          </div>

          {/* emotions */}
          <div className="bg-paper p-8">
            <Eyebrow>Emotions detected</Eyebrow>
            <p className="mb-2 mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              Primary: {s.primaryEmotion || "neutral"}
            </p>
            <EmotionRadarChart distribution={s.emotionScores || {}} height={230} />
          </div>
        </div>
      )}
    </div>
  );
}
