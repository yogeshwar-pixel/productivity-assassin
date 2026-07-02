# build_release.ps1

Write-Host "🚀 Starting Production Build Process..." -ForegroundColor Cyan

$root = Get-Location
$releaseDir = "$root\release_build"
$zipFile = "$root\ProductivityAssassin_Release.zip"

# 1. CLEANUP
if (Test-Path $releaseDir) {
    Write-Host "🧹 Cleaning up old release directory..."
    Remove-Item -Path $releaseDir -Recurse -Force
}
if (Test-Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}

New-Item -ItemType Directory -Path $releaseDir | Out-Null
New-Item -ItemType Directory -Path "$releaseDir\backend" | Out-Null
New-Item -ItemType Directory -Path "$releaseDir\chrome-extension" | Out-Null

# 2. BUILD FRONTEND
Write-Host "🎨 Building Frontend (Expo Web)..." -ForegroundColor Yellow
# Run expo export for web. 
# Note: 'npx expo export -p web' creates a 'dist' folder by default.
cmd /c "npx expo export -p web"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed!"
    exit 1
}

# 3. BUILD BACKEND
Write-Host "⚙️ Building Backend (NestJS)..." -ForegroundColor Yellow
Set-Location "$root\backend"
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend build failed!"
    exit 1
}
Set-Location $root

# 4. ASSEMBLE FILES
Write-Host "📦 Assembling Release Package..." -ForegroundColor Cyan

# Copy Backend Files
Write-Host "   - Copying Backend logic..."
Copy-Item "$root\backend\dist" "$releaseDir\backend\dist" -Recurse
Copy-Item "$root\backend\package.json" "$releaseDir\backend\package.json"
# We need node_modules for the backend to run
# Using Robocopy for speed with node_modules
Write-Host "   - Copying Backend dependencies (this may take a while)..."
robocopy "$root\backend\node_modules" "$releaseDir\backend\node_modules" /E /NFL /NDL /NJH /NJS /nc /ns /np
if ($LASTEXITCODE -ge 8) {
    Write-Error "Robocopy failed!"
    exit 1
}
# Reset exit code from robocopy (anything < 8 is success)
$LASTEXITCODE = 0

# Copy Frontend to backend/client
Write-Host "   - Copying Frontend assets..."
# Expo export output is in 'dist' in the root
Move-Item "$root\dist" "$releaseDir\backend\client"

# Copy Chrome Extension
Write-Host "   - Copying Chrome Extension..."
Copy-Item "$root\chrome-extension\*" "$releaseDir\chrome-extension" -Recurse

# Copy .env (create a default one if needed)
if (Test-Path "$root\backend\.env") {
    Copy-Item "$root\backend\.env" "$releaseDir\backend\.env"
} else {
    Write-Warning "No .env found in backend! You may need to configure it manually."
    # Create dummy .env
    Set-Content -Path "$releaseDir\backend\.env" -Value "DB_HOST=localhost`nDB_PORT=5432`nDB_USER=postgres`nDB_PASSWORD=password`nDB_NAME=productivity_assassin`nJWT_SECRET=production_secret_change_me"
}

# 5. CREATE START SCRIPT
Write-Host "📜 Creating Startup Script..."
$batchContent = @"
@echo off
TITLE Productivity Assassin Server
echo ===================================================
echo   PRODUCTIVITY ASSASSIN - PRODUCTION SERVER
echo ===================================================
echo.
echo [1/3] Checking environment...
if not exist "backend\node_modules" (
    echo CRITICAL ERROR: node_modules missing!
    pause
    exit
)

echo [2/3] Starting Backend Server...
echo      (Access the app at http://localhost:3000)
echo.

cd backend
node dist/main.js

pause
"@
Set-Content -Path "$releaseDir\start_app.bat" -Value $batchContent

# 6. CREATE ZIP
Write-Host "🤐 Zipping it all up..." -ForegroundColor Cyan
Compress-Archive -Path "$releaseDir\*" -DestinationPath $zipFile

Write-Host "✅ DONE! Release created at: $zipFile" -ForegroundColor Green
Write-Host "   - Unzip anywhere"
Write-Host "   - Run start_app.bat"
