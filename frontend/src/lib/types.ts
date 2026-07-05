export interface User {
  id: number;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Sentiment {
  label: string;
  pos: number;
  neg: number;
  neu: number;
  compound: number;
  primaryEmotion: string | null;
  emotionScores: Record<string, number>;
  moodLabel: string;
  moodScore: number;
}

export interface Entry {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  sentiment: Sentiment | null;
}

export interface EntryPage {
  items: Entry[];
  total: number;
  page: number;
  size: number;
}

export interface SearchHit {
  entry: Entry;
  score: number;
}

export interface MoodPoint {
  date: string;
  score: number;
  label: string;
  count: number;
}

export interface MoodSummary {
  currentMood: string;
  currentScore: number;
  averageScore: number;
  totalLogs: number;
  distribution: Record<string, number>;
  recent: MoodPoint[];
}

export interface Stats {
  totalEntries: number;
  totalMoodLogs: number;
  averageMood: number;
  currentMood: string;
  writingStreakDays: number;
  emotionDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
}

export interface ChatSession {
  id: number;
  title: string;
  createdAt: string;
  messageCount: number;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
