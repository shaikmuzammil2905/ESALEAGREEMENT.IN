@echo off
echo ===================================================
echo  eSaleAgreement Admin Panel - GitHub Push Script
echo ===================================================
echo.

git init
git add .
git commit -m "Build Secure Admin Panel + Backend for eSaleAgreement"
git branch -M main

echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/username/esale.git): "

if "%REPO_URL%"=="" (
    echo No repository URL provided. Aborting push.
    pause
    exit /b
)

git remote add origin %REPO_URL% 2>nul || git remote set-url origin %REPO_URL%
git push -u origin main

echo.
echo Code successfully pushed to GitHub!
pause
