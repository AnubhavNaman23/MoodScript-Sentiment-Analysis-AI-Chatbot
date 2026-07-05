/**
 * Streams a chat completion from Ollama's /api/chat (NDJSON stream),
 * invoking onToken for each content chunk. Returns the full assembled text.
 */
export async function streamChat(ollamaUrl, model, messages, onToken) {
  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok || !res.body) {
    const detail = await safeText(res);
    throw new Error(`Ollama error ${res.status}: ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let obj;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }
      const token = obj.message && obj.message.content ? obj.message.content : "";
      if (token) {
        full += token;
        onToken(token);
      }
      if (obj.done) return full;
    }
  }
  return full;
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
