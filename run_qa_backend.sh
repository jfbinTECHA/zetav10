#!/bin/bash
# Script to run the QA Dashboard Backend Server

echo "Starting Zeta AI QA Dashboard Backend Server..."
echo "Make sure you have installed the required packages:"
echo "pip install flask flask-socketio requests eventlet"
echo ""

# Check if Python script exists
if [ ! -f "qa_backend.py" ]; then
    echo "Error: qa_backend.py not found!"
    exit 1
fi

# Run the Flask-SocketIO server
python3 qa_backend.py