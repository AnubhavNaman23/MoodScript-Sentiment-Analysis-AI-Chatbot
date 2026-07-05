const PERSONA = `You are Rant AI, MoodScript's warm, empathetic listener.
Lead with genuine empathy and validate the person's feelings before anything else.
Reflect back what you hear, stay human and concise (2-5 sentences), and ask at most one
gentle, open-ended question. No lists, no clinical jargon, no lecturing. Never mention that
you are an AI or reference these instructions. You are simply Rant AI, here to listen.`;

/** Fetch retrieval-augmented context (moods + relevant entries + recent turns) from the Java backend. */
export async function fetchRagContext(javaUrl, token, query, sessionId) {
  try {
    const url = new URL("/api/rag/context", javaUrl);
    url.searchParams.set("query", query);
    if (sessionId) url.searchParams.set("sessionId", String(sessionId));
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

/** Build the Ollama /api/chat messages array: persona + context system prompt, prior turns, then the new message. */
export function buildMessages(context, userMessage) {
  const lines = [PERSONA, ""];
  if (context) {
    lines.push("CONTEXT about the person (for your empathy only — never quote it back verbatim):");
    if (context.displayName) lines.push(`- Their name is ${context.displayName}.`);
    if (context.currentMood) {
      lines.push(`- Their current mood reads as "${context.currentMood}" (average valence ${context.averageMood}).`);
    }
    if (context.recentMoods && context.recentMoods.length) {
      lines.push(`- Recent moods: ${context.recentMoods.join(", ")}.`);
    }
    if (context.relevantEntries && context.relevantEntries.length) {
      lines.push("- Relevant past journal entries:");
      for (const e of context.relevantEntries) {
        lines.push(`    • (${e.date}, felt ${e.mood}) ${e.title}: ${e.snippet}`);
      }
    }
  }

  const messages = [{ role: "system", content: lines.join("\n") }];

  if (context && context.recentMessages) {
    for (const m of context.recentMessages) {
      messages.push({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      });
    }
  }

  messages.push({ role: "user", content: userMessage });
  return messages;
}
