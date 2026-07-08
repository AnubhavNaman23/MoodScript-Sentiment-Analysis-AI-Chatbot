/**
 * Mood identity colors — used for the small ticks/dots that sit *beside a text label*
 * (identity is never carried by color alone). Retuned as mid-tone hues so they read on
 * both the light "paper" and dark "ink" surfaces. Charts deliberately use a single
 * accent hue or the semantic sentiment trio instead of this full categorical set.
 */
// Validated against both the paper (light) and ink (dark) surfaces with the dataviz
// palette validator: CVD separation worst-adjacent ΔE 16.6 (target ≥12), lightness
// band + contrast all PASS. "neutral" is intentionally gray (a neutral mood should
// read gray) and, like every mood here, is always rendered beside a text label.
export const MOOD_COLORS = {
  joyful: "#C77A00",
  positive: "#2F9E67",
  calm: "#0C97B2",
  neutral: "#8A8377",
  surprised: "#9A4FC7",
  sad: "#3F6FC2",
  low: "#6E5AC6",
  anxious: "#C24A8E",
  angry: "#C4432B",
  disgusted: "#6F8B2E",
};

export function moodColor(label) {
  return MOOD_COLORS[(label || "neutral").toLowerCase()] || "#8A8377";
}

const MOOD_EMOJI = {
  joyful: "😊",
  positive: "🙂",
  calm: "😌",
  neutral: "😐",
  surprised: "😮",
  sad: "😔",
  low: "😞",
  anxious: "😰",
  angry: "😤",
  disgusted: "😖",
};

export function moodEmoji(label) {
  return MOOD_EMOJI[(label || "neutral").toLowerCase()] || "😐";
}

// Single sequential hue for time-series/magnitude charts (theme-aware via chartTheme).
export const CHART_ACCENT = "#B4491F";
export const CHART_ACCENT_SOFT = "#2B8C9E";

// Semantic, always-labeled trio for sentiment polarity — retuned for paper/ink.
export const SENTIMENT_COLORS = {
  positive: "#2F9E67",
  neutral: "#8A8377",
  negative: "#C4432B",
};

/** Theme-aware palette for Recharts (colors can't read CSS vars, so we branch on theme). */
export function chartTheme(dark) {
  return {
    accent: dark ? "#E0A24A" : "#B4491F",
    grid: dark ? "rgba(239,234,224,0.10)" : "rgba(27,24,21,0.10)",
    axis: dark ? "#8D8679" : "#8A8377",
    tooltipBg: dark ? "#1C1A15" : "#FBF9F4",
    tooltipBorder: dark ? "rgba(239,234,224,0.16)" : "rgba(27,24,21,0.16)",
    ink: dark ? "#EFEAE0" : "#1B1815",
    inkSoft: dark ? "#B7B0A3" : "#4A453D",
    inkMuted: dark ? "#8D8679" : "#8A8377",
  };
}

export function titleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
