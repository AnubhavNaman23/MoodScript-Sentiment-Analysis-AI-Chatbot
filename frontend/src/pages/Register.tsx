import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api, apiError } from "../lib/api";
import { useAuth } from "../store/auth";
import { Logo } from "../components/Logo";
import { Eyebrow } from "../components/editorial";
import type { AuthResponse } from "../lib/types";

export default function Register() {
  const [displayName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/api/auth/register", { displayName, email, password });
      setAuth(data.token, data.user);
      navigate("/app");
    } catch (err) {
      setError(apiError(err, "Could not create account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-rule/15 p-12 lg:flex">
        <Link to="/"><Logo /></Link>
        <div>
          <Eyebrow>Issue 01 — New reader</Eyebrow>
          <p className="mt-6 max-w-md font-display text-4xl font-normal leading-tight text-ink">
            Start with a single <span className="italic text-accent">entry.</span>
          </p>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          Sentiment · mood tracking · Rant AI
        </span>
      </aside>

      <main className="flex items-center justify-center px-6 py-16">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-10 inline-block lg:hidden"><Logo /></Link>
          <Eyebrow>Create your journal</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-normal text-ink sm:text-5xl">Sign up</h1>

          <div className="mt-10 space-y-7">
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            {error && <p className="font-mono text-xs text-[#C4432B]">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Creating…" : "Create account →"}
            </button>
          </div>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Already a reader?{" "}
            <Link to="/login" className="text-ink underline decoration-rule/40 underline-offset-4 transition hover:text-accent hover:decoration-accent">
              Log in
            </Link>
          </p>
        </motion.form>
      </main>
    </div>
  );
}
