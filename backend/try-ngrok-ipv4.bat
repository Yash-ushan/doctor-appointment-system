@echo off
echo.
echo ========================================
echo   FORCING NGROK TO USE IPv4
echo ========================================
echo.
echo Trying different methods to get simple ngrok URLs...
echo.

echo Method 1: Using US region...
start "ngrok-us" cmd /k "echo Trying US region for simpler URL... && ngrok http 5000 --region us"

timeout /t 3

echo.
echo Method 2: Using Europe region...
start "ngrok-eu" cmd /k "echo Trying Europe region for simpler URL... && ngrok http 5000 --region eu"

timeout /t 3

echo.
echo Method 3: Using custom hostname binding...
start "ngrok-bind" cmd /k "echo Trying custom binding... && ngrok http 5000 --bind-tls=true"

echo.
echo ========================================
echo   CHECK ALL WINDOWS
echo ========================================
echo.
echo Check all the ngrok windows that opened
echo Look for URLs like:
echo ✅ https://abc123.ngrok.io
echo ✅ https://xyz789.ngrok.io
echo.
echo Avoid URLs like:
echo ❌ https://ca4b-2402-4000-b281-914-c5be-3943-c3b5-eb63.ngrok-free.app
echo.
echo If all methods show IPv6 URLs, use localtunnel instead!
echo.
pause
