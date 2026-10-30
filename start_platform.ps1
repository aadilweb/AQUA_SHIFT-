# AquaShift 2.0 Unified Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   AquaShift 2.0 - Geospatial Agricultural Intelligence   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting Backend FastAPI on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

Write-Host "Starting Frontend Client on http://localhost:3000..." -ForegroundColor Yellow
$frontendJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Write-Host "AquaShift 2.0 is launching!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
