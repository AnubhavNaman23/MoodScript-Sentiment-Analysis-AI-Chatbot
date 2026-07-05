# Shared helper: loads ../.env into the current PowerShell session as $env:* vars.
# Dot-source this from other scripts:  . "$PSScriptRoot\_env.ps1"

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "  .env not found. Copy .env.example to .env and set DB_PASSWORD first." -ForegroundColor Red
    exit 1
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $idx = $line.IndexOf("=")
        $key = $line.Substring(0, $idx).Trim()
        $val = $line.Substring($idx + 1).Trim()
        Set-Item -Path "Env:$key" -Value $val
    }
}

# Common paths
$script:ProjectRoot = $root
$script:PsqlExe = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $script:PsqlExe)) {
    # try to discover any installed version
    $found = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $script:PsqlExe = $found.FullName }
}
