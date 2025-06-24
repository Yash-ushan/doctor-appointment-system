@echo off
echo.
echo ========================================
echo   PAYHERE WEBHOOK SETUP WITH NGROK
echo ========================================
echo.
echo This will help you set up a public webhook URL
echo that PayHere can reach from the internet.
echo.
echo STEP 1: Install ngrok (if not already installed)
echo npm install -g ngrok
echo.
echo STEP 2: Start your backend server
echo npm run dev
echo.
echo STEP 3: Start ngrok (in new terminal)
echo ngrok http 5000
echo.
echo STEP 4: Copy the HTTPS URL from ngrok
echo Example: https://abc123.ngrok.io
echo.
echo STEP 5: Your webhook URL will be:
echo https://abc123.ngrok.io/api/payments/notify
echo.
echo STEP 6: Enter this URL in PayHere sandbox dashboard
echo under Settings > Notifications or API & Integrations
echo.
echo ========================================
echo   STARTING NGROK SETUP
echo ========================================
echo.
pause

echo Checking if ngrok is installed...
ngrok version 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ ngrok is not installed
    echo.
    echo Installing ngrok...
    npm install -g ngrok
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Failed to install ngrok with npm
        echo.
        echo Please install ngrok manually:
        echo 1. Go to https://ngrok.com/download
        echo 2. Download and install ngrok
        echo 3. Run this script again
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ✅ ngrok is installed
echo.
echo Now starting your backend server...
echo Make sure your backend is running on port 5000
echo.
echo Opening new command prompt for ngrok...
start cmd /k "echo Starting ngrok... && ngrok http 5000"

echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo 1. ✅ Your backend should be running on port 5000
echo 2. ✅ ngrok is now exposing your localhost publicly
echo 3. 📋 Copy the HTTPS URL from the ngrok window
echo 4. 🔗 Add /api/payments/notify to the end
echo 5. 📝 Enter this URL in PayHere sandbox dashboard
echo.
echo Example webhook URL:
echo https://abc123.ngrok.io/api/payments/notify
echo.
echo PayHere Dashboard Location:
echo Settings > API ^& Integrations > Notification URL
echo.
pause
