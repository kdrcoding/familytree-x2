@echo off
setlocal
title Family Tree - One-click deploy
cd /d "%~dp0.."

echo ============================================
echo   Shajira family tree - one-click deploy
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Install it from https://nodejs.org first.
    goto :end
)

if not exist node_modules (
    echo Installing dependencies - first run only, takes a minute...
    call npm install
    if errorlevel 1 goto :fail
)

echo Where do you want to deploy?
echo.
echo   [1] Vercel via push to GitHub  (recommended)
echo   [2] Vercel CLI only
echo   [3] Push to GitHub only  (Vercel rebuilds from main)
echo   [4] Build only  (creates the dist folder, deploy it yourself)
echo.
set "choice=1"
set /p choice="Type 1, 2, 3 or 4 and press Enter [1]: "
rem Tolerate stray spaces around the typed answer.
set "choice=%choice: =%"

echo.
echo Checking code and building...
call npm run lint
if errorlevel 1 goto :fail
call npm run build
if errorlevel 1 goto :fail
echo Build OK.
echo.

set "also_github="
if "%choice%"=="4" goto :buildonly
if "%choice%"=="3" goto :github
if "%choice%"=="1" set "also_github=1"
if "%choice%"=="1" goto :github

:vercel
echo Deploying to Vercel...
echo (GitHub is connected — production deploys from main work best.)
echo.
rem Prefer a production deploy of the linked project. If the CLI upload is
rem blocked (git author / team policy), fall back to pushing main so Vercel
rem builds from GitHub instead.
call npx vercel --prod --yes
if errorlevel 1 (
    echo.
    echo CLI deploy was blocked or failed. Pushing main to GitHub so Vercel rebuilds...
    git push origin main
    if errorlevel 1 goto :fail
    echo.
    echo [DONE] Pushed to GitHub — Vercel will rebuild https://ravshanov-family.vercel.app
    if "%also_github%"=="1" goto :end
    goto :end
)
echo.
echo [DONE] Deployed to Vercel!
echo.
echo Your permanent link is:  https://ravshanov-family.vercel.app
echo (It NEVER changes when you deploy. Ignore the random-looking
echo ravshanov-family-xxxxx URLs above - those are internal build addresses;
echo the permanent link always shows the newest version automatically.)
if "%also_github%"=="1" goto :github
goto :end

:github
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git is not installed. Install it from https://git-scm.com first.
    goto :end
)
if not exist .git (
    echo Initializing the git repository...
    git init
    git branch -M main
)
git remote get-url origin >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ACTION NEEDED] No GitHub remote is set up yet. Create an empty repository
    echo on https://github.com/new then run these two commands here once:
    echo.
    echo     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
    echo     git push -u origin main
    echo.
    echo After that, double-click this script again.
    goto :end
)
rem Prefer the known author without rewriting global git config.
git add -A
git -c user.name="Kadir Ravshanov" -c user.email="m.qodir99@gmail.com" commit -m "Update family tree" >nul 2>nul

echo Pulling latest changes from GitHub...
git pull origin main --rebase >nul 2>nul

echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo [HINT] If the push was rejected, open terminal and run this ONCE, then deploy again:
    echo.
    echo     git fetch origin ^&^& git push --force-with-lease origin main
    goto :fail
)
echo.
echo [DONE] Pushed to GitHub. Vercel rebuilds production from main.
echo.
echo Your permanent link:
echo     https://ravshanov-family.vercel.app
goto :end

:buildonly
echo [DONE] Production build created in the "dist" folder.
echo Upload that folder to any static host to publish the site.
goto :end

:fail
echo.
echo [FAILED] Something went wrong - read the messages above.

:end
echo.
pause
