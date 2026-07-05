# ─────────────────────────────────────────────────────────────
# Seed 500+ realistic journal entries + a demo account.
# Runs the Java backend once with the 'seed' profile, which triggers
# DataSeeder, then exits. Flask (sentiment) and Ollama (embeddings)
# should be running for full enrichment; the seeder degrades gracefully
# if they are not.
# Run:  powershell -ExecutionPolicy Bypass -File scripts\seed.ps1
# ─────────────────────────────────────────────────────────────
. "$PSScriptRoot\_env.ps1"
$root = $script:ProjectRoot

Write-Host "Seeding database (this runs the Java app with --seed and exits)..." -ForegroundColor Cyan
Push-Location "$root\backend-java"
& ".\mvnw.cmd" spring-boot:run "-Dspring-boot.run.arguments=--seed"
Pop-Location
Write-Host "Seeding complete. Demo login: demo@moodscript.app / password123" -ForegroundColor Green
