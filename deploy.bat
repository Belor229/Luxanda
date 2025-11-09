@echo off
echo ========================================
echo    LUXANDA - Deploiement Vercel
echo ========================================
echo.

echo Verification de la configuration...
if not exist ".env" (
    echo Copie du fichier de configuration...
    copy env.example .env
    echo.
    echo ⚠️  IMPORTANT: Editez le fichier .env avec vos vraies valeurs !
    echo.
    pause
)

echo.
echo Installation des dependances...
npm install

echo.
echo Construction de l'application...
npm run build

echo.
echo Deploiement sur Vercel...
npx vercel --prod

echo.
echo ========================================
echo Deploiement termine !
echo ========================================
echo.
pause

