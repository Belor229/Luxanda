@echo off
echo ========================================
echo    LUXANDA - Demarrage du Serveur
echo ========================================
echo.

echo [1/4] Verification des dependances...
if not exist "node_modules" (
    echo Installation des dependances frontend...
    npm install
)

if not exist "backend\node_modules" (
    echo Installation des dependances backend...
    cd backend
    npm install
    cd ..
)

echo [2/4] Demarrage du backend...
start "Backend LUXANDA" cmd /k "cd backend && npm run dev"

echo [3/4] Attente du demarrage du backend...
timeout /t 5 /nobreak > nul

echo [4/4] Demarrage du frontend...
start "Frontend LUXANDA" cmd /k "npm run dev"

echo.
echo ========================================
echo    LUXANDA - Demarrage Termine
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer...
pause > nul