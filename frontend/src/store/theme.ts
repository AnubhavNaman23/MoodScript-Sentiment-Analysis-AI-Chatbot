import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => ({ dark: !s.dark })),
    }),
    { name: "moodscript-theme-v2" }
  )
);

/** Drives the subtle mood accent (dot/hairline) from the user's current mood color. */
interface MoodTintState {
  color: string | null;
  setTint: (color: string | null) => void;
}

export const useMoodTint = create<MoodTintState>((set) => ({
  color: null,
  setTint: (color) => set({ color }),
}));
