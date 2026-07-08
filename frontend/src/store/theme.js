import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTheme = create(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => ({ dark: !s.dark })),
    }),
    { name: "moodscript-theme-v2" }
  )
);

/** Drives the subtle mood accent (dot/hairline) from the user's current mood color. */
export const useMoodTint = create((set) => ({
  color: null,
  setTint: (color) => set({ color }),
}));
