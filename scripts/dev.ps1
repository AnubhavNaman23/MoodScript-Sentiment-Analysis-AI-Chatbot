# ─────────────────────────────────────────────────────────────
# MoodScript dev launcher — starts all four services, each in its
# own PowerShell window, plus a health check on Ollama.
# Run:  powershell -ExecutionPolicy Bypass -File scripts\dev.ps1
# ─────────────────────────────────────────────────────────────
. "$PSScriptRoot\_env.ps1"
$root = $script:ProjectRoot

function Start-Svc($title, $workdir, $command) {
    Write-Host "Starting $title..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-ExecutionPolicy", "Bypass",
        "-Command", "`$host.UI.RawUI.WindowTitle='$title'; Set-Location '$workdir'; $command"
    )
}

# ── Ollama check ─────────────────────────────────────────────
try {
    Invoke-RestMethod -Uri "$env:OLLAMA_URL/api/tags" -TimeoutSec 3 | Out-Null
    Write-Host "Ollama is up." -ForegroundColor Green
} catch {
    Write-Host "Ollama not responding at $env:OLLAMA_URL. Start it with 'ollama serve' (or the tray app)." -ForegroundColor Yellow
}

# ── 1. Flask ML (port 8000) ──────────────────────────────────
Start-Svc "MoodScript · Flask ML" "$root\ml-sentiment" ".\.venv\Scripts\python.exe app.py"

# ── 2. Java core API (port 8080) ─────────────────────────────
Start-Svc "MoodScript · Java API" "$root\backend-java" ".\mvnw.cmd spring-boot:run"

# ── 3. Node AI gateway (port 8090) ───────────────────────────
Start-Svc "MoodScript · AI Gateway" "$root\ai-gateway" "npm run dev"

# ── 4. React frontend (port 5173) ────────────────────────────
Start-Svc "MoodScript · Frontend" "$root\frontend" "npm run dev"

Write-Host "`nAll services launching in separate windows." -ForegroundColor Green
Write-Host "  Frontend : http://localhost:$env:FRONTEND_PORT" -ForegroundColor Green
Write-Host "  Java API : http://localhost:$env:JAVA_PORT" -ForegroundColor Green
Write-Host "  Gateway  : http://localhost:$env:GATEWAY_PORT" -ForegroundColor Green
Write-Host "  Flask ML : http://localhost:$env:FLASK_PORT" -ForegroundColor Green
Write-Host "`nDemo login: demo@moodscript.app / password123 (after running scripts\seed.ps1)" -ForegroundColor Green
