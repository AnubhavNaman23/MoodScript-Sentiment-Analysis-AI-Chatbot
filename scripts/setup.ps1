# ─────────────────────────────────────────────────────────────
# MoodScript one-time setup
#   - creates the PostgreSQL database + pgvector extension
#   - creates the Ollama rant-ai model
#   - installs Python (Flask), Node (gateway + frontend) deps
#   - builds the Java backend
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
# ─────────────────────────────────────────────────────────────
. "$PSScriptRoot\_env.ps1"

function Section($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
$root = $script:ProjectRoot

# ── 1. PostgreSQL database + pgvector ────────────────────────
Section "PostgreSQL: create database '$env:DB_NAME'"
$env:PGPASSWORD = $env:DB_PASSWORD
$psql = $script:PsqlExe
if (-not (Test-Path $psql)) { Write-Host "psql.exe not found under C:\Program Files\PostgreSQL. Is PostgreSQL installed?" -ForegroundColor Red; exit 1 }

# Create DB if it doesn't exist (connect to the default 'postgres' db)
$exists = & $psql -U $env:DB_USER -h $env:DB_HOST -p $env:DB_PORT -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$env:DB_NAME'"
if ($exists -ne "1") {
    & $psql -U $env:DB_USER -h $env:DB_HOST -p $env:DB_PORT -d postgres -c "CREATE DATABASE $env:DB_NAME;"
    Write-Host "  Created database $env:DB_NAME" -ForegroundColor Green
} else {
    Write-Host "  Database $env:DB_NAME already exists" -ForegroundColor Yellow
}

Section "PostgreSQL: enable pgvector extension (optional)"
& $psql -U $env:DB_USER -h $env:DB_HOST -p $env:DB_PORT -d $env:DB_NAME -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  pgvector enabled — semantic search will use native vector ops." -ForegroundColor Green
} else {
    Write-Host "  pgvector not available. App will fall back to array-based cosine (still works)." -ForegroundColor Yellow
}

# ── 2. Ollama rant-ai model ──────────────────────────────────
Section "Ollama: create 'rant-ai' model"
$models = ollama list 2>$null
if ($models -match "phi3:mini") {
    ollama create rant-ai -f "$root\ollama\Modelfile"
    Write-Host "  rant-ai model ready." -ForegroundColor Green
} else {
    Write-Host "  Base model phi3:mini not found. Run: ollama pull phi3:mini" -ForegroundColor Yellow
}

# ── 3. Python Flask ML service ───────────────────────────────
Section "Python: create venv + install ML deps (may download ~500MB of models on first run)"
Push-Location "$root\ml-sentiment"
if (-not (Test-Path ".venv")) { python -m venv .venv }
& ".venv\Scripts\python.exe" -m pip install --upgrade pip
& ".venv\Scripts\python.exe" -m pip install -r requirements.txt
Pop-Location
Write-Host "  Flask deps installed." -ForegroundColor Green

# ── 4. Node AI gateway ───────────────────────────────────────
Section "Node: install AI gateway deps"
Push-Location "$root\ai-gateway"
npm install
Pop-Location
Write-Host "  Gateway deps installed." -ForegroundColor Green

# ── 5. React frontend ────────────────────────────────────────
Section "Node: install frontend deps"
Push-Location "$root\frontend"
npm install
Pop-Location
Write-Host "  Frontend deps installed." -ForegroundColor Green

# ── 6. Java backend build ────────────────────────────────────
Section "Java: ensure local Maven is available"
$mvnHome = "$root\backend-java\.tools\apache-maven-3.9.9"
if ((Test-Path "$mvnHome\bin\mvn.cmd") -or (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Host "  Maven available." -ForegroundColor Green
} else {
    Write-Host "  Downloading Apache Maven 3.9.9 (local, no admin needed)..." -ForegroundColor Yellow
    $tools = "$root\backend-java\.tools"
    New-Item -ItemType Directory -Force -Path $tools | Out-Null
    $zip = "$tools\maven.zip"
    $url = "https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip"
    Invoke-WebRequest -Uri $url -OutFile $zip
    Expand-Archive -Path $zip -DestinationPath $tools -Force
    Remove-Item $zip
    Write-Host "  Maven installed to $mvnHome" -ForegroundColor Green
}

Section "Java: build Spring Boot backend (downloads deps on first run)"
Push-Location "$root\backend-java"
& ".\mvnw.cmd" -q -DskipTests package
Pop-Location
Write-Host "  Java backend built." -ForegroundColor Green

Write-Host "`nSetup complete. Start everything with:  powershell -ExecutionPolicy Bypass -File scripts\dev.ps1" -ForegroundColor Green
