import { test } from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import { buildMessages } from "../src/rag.js";
import { authMiddleware } from "../src/auth.js";

test("buildMessages includes persona, context and the new user message last", () => {
  const ctx = {
    displayName: "Anubhav",
    currentMood: "sad",
    averageMood: 0.4,
    recentMoods: ["sad", "anxious"],
    relevantEntries: [{ date: "2025-01-01", title: "Rough day", snippet: "work was hard", mood: "sad" }],
    recentMessages: [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hey there" },
    ],
  };
  const msgs = buildMessages(ctx, "I feel low today");

  assert.equal(msgs[0].role, "system");
  assert.match(msgs[0].content, /Rant AI/);
  assert.match(msgs[0].content, /Anubhav/);
  assert.match(msgs[0].content, /Rough day/);
  assert.ok(msgs.some((m) => m.content === "hi"));
  assert.deepEqual(msgs[msgs.length - 1], { role: "user", content: "I feel low today" });
});

test("buildMessages works with no context", () => {
  const msgs = buildMessages(null, "just venting");
  assert.equal(msgs[0].role, "system");
  assert.deepEqual(msgs[msgs.length - 1], { role: "user", content: "just venting" });
});

test("authMiddleware rejects a missing token", () => {
  const mw = authMiddleware("secret");
  let status;
  const res = {
    status(s) { status = s; return this; },
    json() { return this; },
  };
  mw({ headers: {} }, res, () => assert.fail("next should not be called"));
  assert.equal(status, 401);
});

test("authMiddleware accepts a valid token and attaches claims", () => {
  const secret = "test-secret";
  const token = jwt.sign({ sub: "42", name: "Alice" }, secret, { algorithm: "HS256" });
  const mw = authMiddleware(secret);
  let nexted = false;
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = { status() { return this; }, json() { return this; } };
  mw(req, res, () => { nexted = true; });
  assert.equal(nexted, true);
  assert.equal(req.userId, "42");
  assert.equal(req.userName, "Alice");
});
