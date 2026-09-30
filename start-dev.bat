@echo off
echo Starting Sudhaar Development Servers...
echo.

echo Starting Django Backend Server...
start "Django Backend" cmd /k "cd backend && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo Starting React Frontend Server...
start "React Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause

