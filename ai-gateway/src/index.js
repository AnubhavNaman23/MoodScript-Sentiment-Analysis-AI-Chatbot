import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { authMiddleware } from "./auth.js";
import { fetchRagContext, buildMessages } from "./rag.js";
import { streamChat } from "./ollama.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "ai-gateway" }));

/**
 * Server-Sent Events endpoint. Streams Rant AI tokens to the browser, grounded in
 * the user's moods and journal via RAG, and persists both turns to the Java backend.
 */
app.post("/api/chat/stream", authMiddleware(config.jwtSecret), async (req, res) => {
  const { sessionId, message } = req.body || {};
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    // Persist the user's message first so it survives even if generation fails.
    if (sessionId) {
      await persistMessage(req.token, sessionId, "user", message);
    }

    const context = await fetchRagContext(config.javaUrl, req.token, message, sessionId);
    const messages = buildMessages(context, message);

    const full = await streamChat(config.ollamaUrl, config.chatModel, messages, (token) =>
      send("token", { token })
    );

    if (sessionId) {
      await persistMessage(req.token, sessionId, "assistant", full);
    }
    send("done", { content: full });
    res.end();
  } catch (e) {
    console.error("[ai-gateway] stream error:", e.message);
    send("error", { message: "Rant AI is unavailable right now. Is Ollama running?" });
    res.end();
  }
});

async function persistMessage(token, sessionId, role, content) {
  try {
    await fetch(`${config.javaUrl}/api/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role, content }),
    });
  } catch (e) {
    console.warn("[ai-gateway] failed to persist message:", e.message);
  }
}

app.listen(config.port, () => {
  console.log(`[ai-gateway] listening on http://localhost:${config.port}`);
  console.log(`[ai-gateway] chat model: ${config.chatModel}, java: ${config.javaUrl}`);
});

export { app };
