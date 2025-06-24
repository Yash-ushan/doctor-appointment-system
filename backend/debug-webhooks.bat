@echo off
cd /d "C:\Users\Yashodha\Desktop\yashodha\New projects\doctor-appointment-system\backend"
echo.
echo ========================================
echo   PAYMENT WEBHOOK DEBUGGING SUITE
echo ========================================
echo.
echo This will help diagnose why automatic payment
echo confirmations are not working.
echo.
pause

:MENU
cls
echo.
echo ========================================
echo   PAYMENT DEBUGGING MENU
echo ========================================
echo.
echo 1. Check Payment Status in Database
echo 2. Test Email Configuration
echo 3. Start Webhook Test Server
echo 4. Fix Pending Payments Manually
echo 5. Check Server Logs
echo 6. Test PayHere Webhook URL
echo 7. View Current Environment Settings
echo 8. Exit
echo.
set /p choice="Choose an option (1-8): "

if "%choice%"=="1" goto CHECK_PAYMENTS
if "%choice%"=="2" goto TEST_EMAIL
if "%choice%"=="3" goto WEBHOOK_SERVER
if "%choice%"=="4" goto FIX_PAYMENTS
if "%choice%"=="5" goto SERVER_LOGS
if "%choice%"=="6" goto TEST_WEBHOOK
if "%choice%"=="7" goto ENV_SETTINGS
if "%choice%"=="8" goto EXIT
goto MENU

:CHECK_PAYMENTS
echo.
echo ========================================
echo   CHECKING PAYMENT STATUS
echo ========================================
echo.
node check-payment-status.js
echo.
pause
goto MENU

:TEST_EMAIL
echo.
echo ========================================
echo   TESTING EMAIL CONFIGURATION
echo ========================================
echo.
node test-email.js
echo.
pause
goto MENU

:WEBHOOK_SERVER
echo.
echo ========================================
echo   STARTING WEBHOOK TEST SERVER
echo ========================================
echo.
echo This will start a test server on port 5001
echo to monitor incoming webhook requests.
echo.
echo IMPORTANT: Update your PayHere webhook URL to:
echo http://localhost:5001/api/payments/notify
echo.
echo Press Ctrl+C to stop the server
echo.
pause
node webhook-test-server.js
pause
goto MENU

:FIX_PAYMENTS
echo.
echo ========================================
echo   FIXING PENDING PAYMENTS
echo ========================================
echo.
echo This will manually update pending payments
echo to completed status and send confirmation emails.
echo.
echo WARNING: Only do this if you're sure the
echo payments were actually successful!
echo.
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    node fix-pending-payments-manual.js
) else (
    echo Operation cancelled.
)
echo.
pause
goto MENU

:SERVER_LOGS
echo.
echo ========================================
echo   SERVER LOGS ANALYSIS
echo ========================================
echo.
echo Checking your main server for webhook logs...
echo.
echo INSTRUCTIONS:
echo 1. Make sure your main server is running (npm run dev)
echo 2. Make a test payment
echo 3. Check the server console for webhook notifications
echo.
echo If you don't see webhook notifications, the issue is:
echo - PayHere can't reach your localhost URL
echo - Webhook URL is incorrect in PayHere settings
echo.
pause
goto MENU

:TEST_WEBHOOK
echo.
echo ========================================
echo   TESTING WEBHOOK URL
echo ========================================
echo.
echo Current webhook URL: %SERVER_URL%/api/payments/notify
echo.
echo ISSUES WITH LOCALHOST:
echo - PayHere cannot reach localhost URLs from the internet
echo - You need a public URL for webhooks to work
echo.
echo SOLUTIONS:
echo 1. Use ngrok to expose localhost publicly
echo 2. Deploy to a cloud service (Heroku, Vercel, etc.)
echo 3. Use a VPS with public IP
echo.
echo Example with ngrok:
echo 1. Install ngrok
echo 2. Run: ngrok http 5000
echo 3. Copy the public URL (e.g., https://abc123.ngrok.io)
echo 4. Update PayHere webhook to: https://abc123.ngrok.io/api/payments/notify
echo.
pause
goto MENU

:ENV_SETTINGS
echo.
echo ========================================
echo   ENVIRONMENT SETTINGS
echo ========================================
echo.
echo SERVER_URL: %SERVER_URL%
echo CLIENT_URL: %CLIENT_URL%
echo PAYHERE_SANDBOX: %PAYHERE_SANDBOX%
echo PAYHERE_MERCHANT_ID: %PAYHERE_MERCHANT_ID%
echo EMAIL_USER: %EMAIL_USER%
echo.
echo WEBHOOK URL: %SERVER_URL%/api/payments/notify
echo.
echo ANALYSIS:
if "%SERVER_URL%"=="http://localhost:5000" (
    echo ⚠️  WARNING: Using localhost - PayHere cannot reach this URL
    echo    Solution: Use ngrok or deploy to cloud service
) else (
    echo ✅ Using public URL - Should work for webhooks
)
echo.
pause
goto MENU

:EXIT
echo.
echo ========================================
echo   DEBUGGING COMPLETE
echo ========================================
echo.
echo Common solutions to fix webhook issues:
echo.
echo 1. LOCALHOST ISSUE (Most Common):
echo    - Use ngrok: ngrok http 5000
echo    - Update PayHere webhook URL to ngrok URL
echo.
echo 2. FIX EXISTING PENDING PAYMENTS:
echo    - Use option 4 to manually fix pending payments
echo.
echo 3. EMAIL CONFIGURATION:
echo    - Use option 2 to test email setup
echo.
echo 4. DEPLOY TO CLOUD:
echo    - Deploy backend to Heroku/Railway/Vercel
echo    - Update PayHere webhook URL to deployed URL
echo.
echo Thank you for using the debugging suite!
echo.
pause
exit
