import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load the shared project-root .env when running standalone.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.GATEWAY_PORT || "8090", 10),
  // Must match the Java backend's app.jwt.secret exactly.
  jwtSecret:
    process.env.JWT_SECRET ||
    "moodscript-super-secret-change-me-to-a-long-random-string-1234567890",
  javaUrl: process.env.JAVA_API_URL || "http://localhost:8080",
  ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
  chatModel: process.env.OLLAMA_CHAT_MODEL || "rant-ai",
};
