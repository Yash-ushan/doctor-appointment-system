@echo off
echo.
echo ========================================
echo   GETTING SIMPLE NGROK URL
echo ========================================
echo.
echo Step 1: Stopping any existing ngrok...
taskkill /f /im ngrok.exe 2>nul

echo.
echo Step 2: Starting fresh ngrok session...
echo Looking for simpler URL format...
echo.

start "ngrok - Doctor Appointment System" cmd /k "echo Starting ngrok for Doctor Appointment System... && echo. && echo Looking for simple URL format like: https://abc123.ngrok.io && echo. && ngrok http 5000"

echo.
echo ========================================
echo   INSTRUCTIONS
echo ========================================
echo.
echo 1. Check the ngrok window that just opened
echo 2. Look for a URL like: https://abc123.ngrok.io
echo 3. If you see a complex IPv6 URL, close ngrok and try again
echo 4. Copy the simple HTTPS URL
echo 5. Use ONLY the domain part in PayHere (e.g., abc123.ngrok.io)
echo.
echo PAYHERE DOMAIN FORMAT:
echo ✅ CORRECT: abc123.ngrok.io
echo ❌ WRONG: 1cad-2402-4000-b281-914-c5be-3943-c3b5-eb63.ngrok-free.app
echo.
echo If you keep getting complex URLs, try:
echo ngrok http 5000 --region us
echo or
echo ngrok http 5000 --region eu
echo.
pause
