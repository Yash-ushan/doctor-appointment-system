@echo off
echo.
echo ========================================
echo   PAYHERE NGROK SETUP
echo ========================================
echo.
echo Step 1: Starting your backend server...
echo.
start "Backend Server" cmd /k "cd /d \"C:\Users\Yashodha\Desktop\yashodha\New projects\doctor-appointment-system\backend\" && npm run dev"

timeout /t 3

echo.
echo Step 2: Starting ngrok...
echo.
start "ngrok" cmd /k "ngrok http 5000"

echo.
echo Step 3: Instructions for PayHere configuration
echo.
echo 1. Wait for ngrok to start (check the ngrok window)
echo 2. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)
echo 3. In PayHere dashboard, click "Add Domain/App"
echo 4. Enter your ngrok domain (abc123.ngrok.io)
echo 5. Set webhook URL to: https://abc123.ngrok.io/api/payments/notify
echo.
echo ========================================
echo   IMPORTANT WEBHOOK URL
echo ========================================
echo.
echo Your webhook URL format:
echo https://YOUR-NGROK-URL.ngrok.io/api/payments/notify
echo.
echo Example:
echo https://abc123.ngrok.io/api/payments/notify
echo.
pause
