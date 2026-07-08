/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "Times New Roman", "serif"],
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // All theme-flipping tokens are driven by CSS variables (see index.css).
        // Paper = the light "paper" surface; ink = the text/foreground; both invert
        // under `.dark` (the "ink" mode) from the same class names.
        paper: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          raised: "rgb(var(--paper-raised) / <alpha-value>)",
          sunk: "rgb(var(--paper-sunk) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
        },
        rule: "rgb(var(--rule) / <alpha-value>)",
      },
      keyframes: {
        // headline lines rise from behind a mask
        reveal: {
          from: { transform: "translateY(110%)" },
          to: { transform: "translateY(0)" },
        },
        // hairline rules that draw in
        draw: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        // seamless marquee for the mood ticker
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        // indeterminate progress sweep (loader)
        progress: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(320%)" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        ticker: "ticker 34s linear infinite",
        progress: "progress 1.1s ease-in-out infinite",
        blink: "blink 1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};
