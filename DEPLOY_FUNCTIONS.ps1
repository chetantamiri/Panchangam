# ============================================================
# Panchangam App - Deploy Firebase Cloud Functions
# Double-click this file to deploy the deleteAuthUser function
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Panchangam Firebase Functions Deploy  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "      Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "      ERROR: Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: Install Firebase CLI if missing
Write-Host "[2/5] Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseInstalled = $null
try { $firebaseInstalled = firebase --version 2>$null } catch {}

if (-not $firebaseInstalled) {
    Write-Host "      Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
    Write-Host "      Firebase CLI installed." -ForegroundColor Green
} else {
    Write-Host "      Firebase CLI found: $firebaseInstalled" -ForegroundColor Green
}

# Step 3: Firebase Login
Write-Host ""
Write-Host "[3/5] Logging into Firebase..." -ForegroundColor Yellow
Write-Host "      A browser window will open. Log in with the Google account" -ForegroundColor White
Write-Host "      that owns your Firebase project." -ForegroundColor White
Write-Host ""
firebase login

# Step 4: Install function dependencies
Write-Host ""
Write-Host "[4/5] Installing Cloud Function dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\functions"
npm install
Write-Host "      Dependencies installed." -ForegroundColor Green

# Step 5: Deploy
Write-Host ""
Write-Host "[5/5] Deploying to Firebase..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot"
firebase deploy --only functions,firestore:rules

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DONE! Function deployed successfully  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "The 'Delete User' button in your app will now:" -ForegroundColor White
Write-Host "  - Delete the user from Firebase Authentication" -ForegroundColor White
Write-Host "  - Delete the user from Firestore database" -ForegroundColor White
Write-Host "  - Force them to register again from scratch" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to close"
