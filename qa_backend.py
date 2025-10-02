#!/usr/bin/env python3
"""
Zeta AI QA Dashboard Backend Server
Real-time WebSocket server for QA monitoring dashboard
"""

import os
import json
import time
import threading
from datetime import datetime
from flask import Flask, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
import eventlet
eventlet.monkey_patch()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Global data storage
current_data = None
historical_data = None
last_update = None

def load_json_file(filename, default=None):
    """Load JSON file with error handling"""
    try:
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
    return default

def save_json_file(filename, data):
    """Save data to JSON file"""
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving {filename}: {e}")

def broadcast_updates():
    """Broadcast updates to all connected clients"""
    while True:
        try:
            # Load latest data
            global current_data, historical_data, last_update

            new_current = load_json_file('kilo_qa_checklist_results.json')
            new_historical = load_json_file('kilo_qa_history.json')

            # Check if data has changed
            if new_current != current_data or new_historical != historical_data:
                current_data = new_current
                historical_data = new_historical
                last_update = datetime.now().isoformat()

                # Broadcast to all clients
                socketio.emit('qa_update', {
                    'current': current_data,
                    'historical': historical_data,
                    'timestamp': last_update
                })

                print(f"Data updated and broadcasted at {last_update}")

        except Exception as e:
            print(f"Error in broadcast loop: {e}")

        # Check every 2 seconds (faster than AJAX polling)
        eventlet.sleep(2)

@app.route('/')
def index():
    return send_from_directory('.', 'qa-dashboard-realtime.html')

@app.route('/api/qa-data')
def get_qa_data():
    """REST API endpoint for current data"""
    return jsonify({
        'current': current_data,
        'historical': historical_data,
        'timestamp': last_update
    })

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('qa_update', {
        'current': current_data,
        'historical': historical_data,
        'timestamp': last_update
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

@socketio.on('request_update')
def handle_request_update():
    """Handle manual update requests"""
    emit('qa_update', {
        'current': current_data,
        'historical': historical_data,
        'timestamp': last_update
    })

if __name__ == '__main__':
    print("Starting Zeta AI QA Dashboard Backend Server...")

    # Load initial data
    current_data = load_json_file('kilo_qa_checklist_results.json', [])
    historical_data = load_json_file('kilo_qa_history.json', {})
    last_update = datetime.now().isoformat()

    # Start broadcast thread
    broadcast_thread = threading.Thread(target=broadcast_updates, daemon=True)
    broadcast_thread.start()

    print("Server ready. Open http://localhost:5000 in your browser")
    print("WebSocket clients will receive real-time updates")

    # Start server
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)