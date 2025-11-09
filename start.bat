@echo off
echo ========================================
echo    LUXANDA - Marketplace Africaine
echo ========================================
echo.

echo Demarrage du backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo.
echo Demarrage du frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Application demarree !
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo ========================================
echo.
pause
