@echo off
echo Starting Firebase Emulators...
echo This will start the Authentication emulator on port 9099
echo.
firebase emulators:start --only auth
pause