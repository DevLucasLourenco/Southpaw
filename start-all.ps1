param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$venvDir = Join-Path $backendDir ".venv"
$pythonExe = Join-Path $venvDir "Scripts\python.exe"
$activateScript = Join-Path $venvDir "Scripts\Activate.ps1"
$backendEnvFile = Join-Path $backendDir ".env"
$backendEnvExample = Join-Path $backendDir ".env.example"

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

if (-not (Test-Path $backendEnvFile) -and (Test-Path $backendEnvExample)) {
    Write-Step "Criando backend/.env a partir de .env.example"
    Copy-Item $backendEnvExample $backendEnvFile
}

if (-not (Test-Path $venvDir)) {
    Write-Step "Criando ambiente virtual do backend"
    python -m venv $venvDir
}

if (-not (Test-Path $pythonExe)) {
    throw "Nao foi possivel localizar o Python da virtualenv em $pythonExe"
}

if (-not $SkipInstall) {
    Write-Step "Atualizando pip e instalando dependencias do backend"
    & $pythonExe -m pip install --upgrade pip
    & $pythonExe -m pip install -e $backendDir

    if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
        Write-Step "Instalando dependencias do frontend"
        Push-Location $frontendDir
        try {
            npm install
        }
        finally {
            Pop-Location5
        }
    }
}

Write-Step "Iniciando backend em nova janela"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendDir'; & '$activateScript'; uvicorn app.main:app --reload --port 8000"
)

Write-Step "Iniciando frontend em nova janela"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendDir'; npm run dev"
)

Write-Step "Servicos iniciados"
Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "Docs da API: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Banco SQLite esperado em: backend/data/southpaw.db" -ForegroundColor Yellow

Write-Step "Aguardando frontend iniciar..."
Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"
