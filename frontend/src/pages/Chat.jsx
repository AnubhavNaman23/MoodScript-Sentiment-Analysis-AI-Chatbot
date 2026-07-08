import { useEffect, useRef, useState } from "react";
import { Send, Plus, Trash2 } from "lucide-react";
import { api, GATEWAY_URL } from "../lib/api";
import { useAuth } from "../store/auth";
import { ChatBubble } from "../components/ChatBubble";
import { TypingDots } from "../components/Loader";
import { Eyebrow } from "../components/editorial";

const STARTERS = [
  "I've had a really long, draining week.",
  "I'm proud of something I did today.",
  "I can't stop overthinking lately.",
  "I just need to vent for a minute.",
];

export default function Chat() {
  const token = useAuth((s) => s.token);
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/api/chat/sessions").then(({ data }) => {
      setSessions(data);
      if (data.length) selectSession(data[0].id);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectSession = async (id) => {
    setActiveId(id);
    const { data } = await api.get(`/api/chat/sessions/${id}/messages`);
    setMessages(data.map((m) => ({ role: m.role, content: m.content })));
  };

  const newChat = async () => {
    const { data } = await api.post("/api/chat/sessions", {});
    setSessions((prev) => [data, ...prev]);
    setActiveId(data.id);
    setMessages([]);
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/api/chat/sessions/${id}`);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const send = async (text) => {
    const message = text.trim();
    if (!message || streaming) return;

    let sessionId = activeId;
    if (!sessionId) {
      const { data } = await api.post("/api/chat/sessions", {});
      sessionId = data.id;
      setSessions((prev) => [data, ...prev]);
      setActiveId(data.id);
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      await streamChat(
        token,
        sessionId,
        message,
        (tok) => setMessages((prev) => updateLast(prev, (m) => ({ ...m, content: m.content + tok }))),
        () => refreshSessions(),
        (errMsg) => setMessages((prev) => updateLast(prev, (m) => ({ ...m, content: m.content || errMsg })))
      );
    } finally {
      setStreaming(false);
    }
  };

  const refreshSessions = () => {
    api.get("/api/chat/sessions").then(({ data }) => setSessions(data));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* sessions */}
      <aside className="hidden lg:block">
        <button onClick={newChat} className="btn-ghost mb-6 w-full justify-start">
          <Plus size={15} /> New conversation
        </button>
        <div className="border-t border-rule/12">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSession(s.id)}
              className={`group flex w-full items-center gap-2 border-b border-rule/12 py-3 pl-3 text-left font-mono text-[11px] uppercase tracking-[0.12em] transition ${
                activeId === s.id ? "border-l-2 border-l-accent text-ink" : "border-l-2 border-l-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <span className="flex-1 truncate normal-case">{s.title}</span>
              <span onClick={(e) => deleteChat(s.id, e)} className="opacity-0 transition group-hover:opacity-100 hover:text-[#C4432B]">
                <Trash2 size={13} />
              </span>
            </button>
          ))}
          {sessions.length === 0 && <p className="py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">No conversations yet.</p>}
        </div>
      </aside>

      {/* correspondence */}
      <div className="panel flex h-[calc(100vh-11rem)] flex-col">
        <div className="flex items-center justify-between border-b border-rule/15 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
            <div>
              <div className="font-display text-lg font-normal text-ink">Rant AI</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">Empathetic · here to listen</div>
            </div>
          </div>
          <button onClick={newChat} className="text-ink-muted transition hover:text-accent lg:hidden" title="New conversation">
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Eyebrow>A private correspondence</Eyebrow>
              <h2 className="mt-4 font-display text-4xl font-normal text-ink">What's on your mind?</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
                Rant AI listens without judgment and remembers how you've been feeling.
              </p>
              <div className="mt-8 flex w-full max-w-md flex-col border-t border-rule/12">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="group flex items-center justify-between border-b border-rule/12 py-3 text-left text-sm text-ink-soft transition hover:text-accent"
                  >
                    <span>{s}</span>
                    <span className="translate-x-0 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => {
              const isStreamingLast = streaming && i === messages.length - 1 && m.role === "assistant" && !m.content;
              return isStreamingLast ? (
                <div key={i} className="border-t border-rule/12 pt-4">
                  <div className="eyebrow mb-2 text-accent">Rant AI</div>
                  <TypingDots />
                </div>
              ) : (
                <ChatBubble key={i} message={m} />
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-rule/15 p-4">
          <div className="flex items-end gap-3">
            <textarea
              className="max-h-32 min-h-[46px] flex-1 resize-none bg-transparent py-2.5 leading-relaxed text-ink outline-none placeholder:text-ink-muted"
              placeholder="Tell Rant AI anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
            />
            <button type="submit" disabled={streaming || !input.trim()} className="btn-primary !px-4 !py-3">
              <Send size={17} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function updateLast(list, fn) {
  if (!list.length) return list;
  const copy = list.slice();
  copy[copy.length - 1] = fn(copy[copy.length - 1]);
  return copy;
}

/** Streams SSE tokens from the Node gateway. */
async function streamChat(token, sessionId, message, onToken, onDone, onError) {
  let res;
  try {
    res = await fetch(`${GATEWAY_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, message }),
    });
  } catch {
    onError("Can't reach Rant AI. Is the gateway running?");
    return;
  }
  if (!res.ok || !res.body) {
    onError("Rant AI is unavailable right now.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      let event = "message";
      let data = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        const payload = JSON.parse(data);
        if (event === "token") onToken(payload.token);
        else if (event === "done") onDone(payload.content);
        else if (event === "error") onError(payload.message);
      } catch {
        /* ignore malformed frame */
      }
    }
  }
}
