import { motion, useReducedMotion } from "framer-motion";
import type { ChatMessage } from "../lib/types";

/**
 * Chat as typeset correspondence, not bubbles: a mono speaker label over a hairline,
 * then the message. Rant AI answers in Fraunces (a literary voice); you speak in sans.
 */
export function ChatBubble({ message }: { message: Pick<ChatMessage, "role" | "content"> }) {
  const reduce = useReducedMotion();
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-rule/12 pt-4"
    >
      <div className={`eyebrow mb-2 ${isUser ? "text-ink-muted" : "text-accent"}`}>
        {isUser ? "You" : "Rant AI"}
      </div>
      <p
        className={
          isUser
            ? "whitespace-pre-wrap font-sans leading-relaxed text-ink-soft"
            : "whitespace-pre-wrap font-display text-lg leading-relaxed text-ink"
        }
      >
        {message.content || " "}
      </p>
    </motion.div>
  );
}
