# MoodScript — Handoff / Resume Notes

> Compact state file for resuming work fast. Last updated at end of the build session.

## TL;DR status

**The project is code-complete and unit-tested. Only the live PostgreSQL run is left** (deferred —
needs the Postgres password). Everything else is built and verified.

| Component | Path | Status |
|---|---|---|
| React frontend (Aurora UI, 8 pages, streaming chat, charts) | `frontend/` | ✅ builds clean (2817 modules) |
| Java Spring Boot core API | `backend-java/` | ✅ compiles · **9 tests pass** |
| Python Flask transformer ML | `ml-sentiment/` | ✅ **2 tests** · real RoBERTa/DistilRoBERTa inference verified |
| Node AI gateway (SSE) | `ai-gateway/` | ✅ **4 tests** · live 71-token SSE stream verified |
| Ollama `rant-ai` model | `ollama/Modelfile` | ✅ created (`rant-ai:latest`), replies in-persona |
| DB schema + 500+ seeder | `backend-java/.../seed/DataSeeder.java`, `db/migration/V1__init.sql` | ✅ written, not yet run |

**Verified live already (no DB needed):** Flask `/health` + real inference; gateway `/health`; gateway
→ Ollama SSE streaming with shared-secret JWT; `rant-ai` empathetic responses.

**Not yet done:** create the `moodscript` database, run migrations (auto on Java boot), seed 500+ entries,
boot the Java API + frontend, browser QA of the full flow.

## The finish line (what a human/next session runs)

```powershell
cd c:\Users\anubh\OneDrive\Desktop\MoodScript
copy .env.example .env          # then edit .env → set DB_PASSWORD to the postgres user's password
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1   # creates DB, ollama model, deps, build
powershell -ExecutionPolicy Bypass -File scripts\seed.ps1    # 500+ demo entries (start Flask+Ollama first for real scores)
powershell -ExecutionPolicy Bypass -File scripts\dev.ps1     # launches all 4 services
# open http://localhost:5173  ·  demo login: demo@moodscript.app / password123
```

**Blocker:** PostgreSQL 18 uses `scram-sha-256` (see `data/pg_hba.conf`), so `DB_PASSWORD` in `.env`
must be the real password for the `postgres` user (set at install). Nothing else is missing.

## Environment facts (this machine)

- **PostgreSQL 18** running as service `postgresql-x64-18`; `psql.exe` at
  `C:\Program Files\PostgreSQL\18\bin\psql.exe` (not on PATH); pgvector source present but the app does
  **not** require the extension (cosine is done in Java — graceful fallback).
- **Ollama 0.31** with `phi3:mini`, `llama2`, `nomic-embed-text`, and the created `rant-ai`.
- **Java 21**, **Node 24**, **Python 3.13**. **No Docker.** No global Maven — a local Maven was
  downloaded to `backend-java\.tools\apache-maven-3.9.9` (the `mvnw.cmd` shim uses it).
- First Flask launch downloads ~500MB of HF weights into `ml-sentiment/models_cache/`; **already done**
  this session, so it runs offline now.

## Service / port map

| Service | Port | Health |
|---|---|---|
| Frontend (Vite) | 5173 | — |
| Java core API | 8080 | `/actuator/health` |
| Node AI gateway | 8090 | `/health` |
| Flask ML | 8000 | `/health` |
| Ollama | 11434 | `/api/tags` |
| PostgreSQL | 5432 | — |

⚠️ Background **Flask (:8000)** and **gateway (:8090)** may still be running from verification. If
`dev.ps1` reports a port in use, close those windows/processes first (or just reuse them).

## Key files by service (the ones that matter)

- **Java** — `MoodscriptApplication.java`; `config/{SecurityConfig,JwtAuthFilter,RestClientConfig,AppProperties}.java`;
  `auth/*`; `entry/EntryService.java` (orchestrates sentiment+embedding+mood); `sentiment/SentimentClient.java`;
  `embedding/{EmbeddingClient,EmbeddingService}.java`; `mood/*`; `stats/StatsService.java`;
  `chat/{ChatService,RagService,ChatController,RagController}.java`; `seed/DataSeeder.java`;
  `resources/application.yml`; `resources/db/migration/V1__init.sql`.
- **Flask** — `ml-sentiment/models.py` (2 HF pipelines), `app.py` (`/analyze`, `/health`).
- **Gateway** — `ai-gateway/src/{index.js (SSE), auth.js (JWT), rag.js (prompt build), ollama.js (stream), config.js}`.
- **Frontend** — `frontend/src/lib/{api.ts,types.ts,moodColors.ts,format.ts}`, `store/{auth,theme}.ts`,
  `components/*` (+ `charts/*`), `pages/{Landing,Login,Register,Dashboard,Journal,EntryDetail,Chat,Insights}.tsx`.
- **Config/scripts** — `.env.example`, `scripts/{_env,setup,dev,seed}.ps1`, `ollama/Modelfile`.

## Architecture in one line

React ⇄ Java (owns Postgres; calls Flask for sentiment + Ollama for embeddings) ; browser streams Rant AI
from Node gateway, which pulls RAG context from Java and generates via Ollama `rant-ai`. Shared HS256
`JWT_SECRET` lets the gateway verify Java-issued tokens.

## Design decisions to remember

- **Java is the only service that touches the DB.** Flask = pure ML, Gateway = pure LLM streaming.
- Embeddings stored as JSON text (`entry_embeddings.embedding`) → cosine in `EmbeddingService` → works
  with or without pgvector.
- Charts use a single validated hue (timeline/radar) + semantic sentiment trio; vibrant per-mood colors
  are only used where a text label is always present (orbs/badges/aurora).
- `rant-ai` persona lives in `ollama/Modelfile` **and** is restated in `ai-gateway/src/rag.js` (the API
  path sends a system prompt, so the persona is duplicated intentionally for determinism).

## Tests (all green)

```powershell
cd backend-java;  .\mvnw.cmd test                      # 9 pass
cd ml-sentiment;  .venv\Scripts\python -m pytest       # 2 pass
cd ai-gateway;    npm test                             # 4 pass
cd frontend;      npm run build                         # clean
```

## Resume here → next actions

1. Get `DB_PASSWORD` into `.env`, run `setup.ps1` + `seed.ps1` + `dev.ps1`.
2. Browser QA: register/login, dashboard charts populated, new entry shows live sentiment, semantic
   search returns relevant entries, Rant AI streams + persists across reload.
3. (Optional) `git init` + first commit — repo is not yet under version control.
