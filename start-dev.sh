#!/bin/bash

echo "Starting Sudhaar Development Servers..."
echo ""

# Start Django backend in background
echo "Starting Django Backend Server..."
cd backend
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start React frontend
echo "Starting React Frontend Server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

