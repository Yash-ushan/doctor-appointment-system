@echo off
echo.
echo ========================================
echo   SETTING UP LOCALTUNNEL FOR PAYHERE
echo ========================================
echo.
echo localtunnel provides simpler URLs that PayHere accepts
echo.
echo Step 1: Installing localtunnel...
npm install -g localtunnel
if %errorlevel% neq 0 (
    echo ❌ Failed to install localtunnel
    pause
    exit /b 1
)

echo.
echo ✅ localtunnel installed successfully
echo.
echo Step 2: Starting your backend server...
start "Backend Server" cmd /k "cd /d \"C:\Users\Yashodha\Desktop\yashodha\New projects\doctor-appointment-system\backend\" && npm run dev"

timeout /t 3

echo.
echo Step 3: Starting localtunnel...
echo This will create a tunnel like: https://doctor-appointment.loca.lt
echo.
start "localtunnel" cmd /k "echo Starting localtunnel tunnel... && echo. && lt --port 5000 --subdomain doctor-appointment && echo. && echo Your tunnel URL is ready! && echo Use this URL in PayHere: https://doctor-appointment.loca.lt && pause"

echo.
echo ========================================
echo   PAYHERE CONFIGURATION
echo ========================================
echo.
echo Your tunnel URL will be:
echo https://doctor-appointment.loca.lt
echo.
echo In PayHere dashboard:
echo 1. Domain: doctor-appointment.loca.lt
echo 2. Webhook URL: https://doctor-appointment.loca.lt/api/payments/notify
echo.
echo ✅ This simple URL format works with PayHere!
echo.
pause
