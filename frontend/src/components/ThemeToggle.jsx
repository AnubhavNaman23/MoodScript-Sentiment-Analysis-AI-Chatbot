import { Moon, Sun } from "lucide-react";
import { useTheme } from "../store/theme";

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="text-ink-muted transition hover:text-accent"
      aria-label={dark ? "Switch to paper (light) mode" : "Switch to ink (dark) mode"}
      title={dark ? "Paper mode" : "Ink mode"}
    >
      {dark ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
    </button>
  );
}
