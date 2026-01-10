# Start the 3D API server
# Make sure you have configured your Azure credentials

Write-Host "Starting Leaf Guard 3D API Server..." -ForegroundColor Green

# Check if virtual environment exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
} elseif (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & ".venv\Scripts\Activate.ps1"
} else {
    Write-Host "No virtual environment found. Installing dependencies globally..." -ForegroundColor Yellow
}

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r backend\requirements.txt

# Check if .env file exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "Warning: .env file not found. Please copy .env.example to .env and configure your Azure credentials." -ForegroundColor Red
    Write-Host "You can still run the server, but Azure integration won't work." -ForegroundColor Yellow
    Read-Host "Press Enter to continue or Ctrl+C to exit"
}

# Start the server
Write-Host "Starting FastAPI server on http://localhost:8000..." -ForegroundColor Green
Write-Host "API documentation will be available at http://localhost:8000/docs" -ForegroundColor Cyan

Set-Location backend
python -m uvicorn api_3d:app --host 0.0.0.0 --port 8000 --reload