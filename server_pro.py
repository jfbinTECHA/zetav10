#!/usr/bin/env python3
"""
Enhanced QA Dashboard Server with Authentication & Multiple Notifications
Production-ready with Docker support
"""

import os
import json
import time
import smtplib
import requests
from email.mime.text import MIMEText
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_socketio import SocketIO, emit, disconnect
from functools import wraps
import eventlet
eventlet.monkey_patch()

app = Flask(__name__, template_folder="templates")
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# -------------------------------
# Enhanced Configuration
# -------------------------------
API_BASE_URL = os.environ.get('API_BASE_URL', "http://localhost:3000")
PLACEHOLDERS = {"user_id": "123", "workflow_id": "456", "image_id": "789"}
REFRESH_INTERVAL = int(os.environ.get('REFRESH_INTERVAL', 10))

# Authentication
DASHBOARD_USERNAME = os.environ.get('DASHBOARD_USERNAME', 'admin')
DASHBOARD_PASSWORD = os.environ.get('DASHBOARD_PASSWORD', 'password')
REQUIRE_AUTH = os.environ.get('REQUIRE_AUTH', 'true').lower() == 'true'

# Notification Channels
SLACK_WEBHOOK_URL = os.environ.get('SLACK_WEBHOOK_URL')
DISCORD_WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL')
TEAMS_WEBHOOK_URL = os.environ.get('TEAMS_WEBHOOK_URL')

# Email Configuration
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
EMAIL_FROM = os.environ.get('EMAIL_FROM', SMTP_USERNAME)
EMAIL_TO = os.environ.get('EMAIL_TO')

# Files
JSON_INPUT_FILE = "kilo_qa_checklist.json"
JSON_RESULTS_FILE = "kilo_qa_checklist_results.json"
HISTORY_FILE = "kilo_qa_history.json"

# -------------------------------
# Authentication Decorator
# -------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if REQUIRE_AUTH and not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# -------------------------------
# Notification Functions
# -------------------------------
def send_slack_notification(module_name, test_case, notes):
    if not SLACK_WEBHOOK_URL:
        return
    payload = {
        "text": f":warning: New QA Test Failed!\n*Module:* {module_name}\n*Test Case:* {test_case}\n*Notes:* {notes}"
    }
    try:
        requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=5)
        print("Slack notification sent")
    except Exception as e:
        print("Slack send error:", e)

def send_discord_notification(module_name, test_case, notes):
    if not DISCORD_WEBHOOK_URL:
        return
    payload = {
        "content": f"🚨 **New QA Test Failed!**\n**Module:** {module_name}\n**Test Case:** {test_case}\n**Notes:** {notes}"
    }
    try:
        requests.post(DISCORD_WEBHOOK_URL, json=payload, timeout=5)
        print("Discord notification sent")
    except Exception as e:
        print("Discord send error:", e)

def send_teams_notification(module_name, test_case, notes):
    if not TEAMS_WEBHOOK_URL:
        return
    payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "QA Test Failure",
        "sections": [{
            "activityTitle": "🚨 New QA Test Failed!",
            "facts": [
                {"name": "Module:", "value": module_name},
                {"name": "Test Case:", "value": test_case},
                {"name": "Notes:", "value": notes}
            ]
        }]
    }
    try:
        requests.post(TEAMS_WEBHOOK_URL, json=payload, timeout=5)
        print("Teams notification sent")
    except Exception as e:
        print("Teams send error:", e)

def send_email_notification(module_name, test_case, notes):
    if not all([SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD, EMAIL_TO]):
        return

    msg = MIMEText(f"""
New QA Test Failure Detected!

Module: {module_name}
Test Case: {test_case}
Notes: {notes}

Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
""")

    msg['Subject'] = f'QA Test Failure: {module_name} - {test_case}'
    msg['From'] = EMAIL_FROM
    msg['To'] = EMAIL_TO

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(EMAIL_FROM, EMAIL_TO, msg.as_string())
        server.quit()
        print("Email notification sent")
    except Exception as e:
        print("Email send error:", e)

# -------------------------------
# Core Functions (same as before)
# -------------------------------
def fill_placeholders(endpoint, placeholders):
    for k, v in placeholders.items():
        endpoint = endpoint.replace(f"{{{k}}}", v)
    return endpoint

def check_response(actual, expected, check_type):
    try:
        if check_type == "exact":
            return actual == expected
        elif check_type == "contains":
            if isinstance(expected, dict):
                return all(item in actual.items() for item in expected.items())
            else:
                return expected in actual
        elif check_type == "range":
            return all(actual.get(k, 0) <= v["max"] for k, v in expected.items())
        elif check_type == "range_contains":
            for k, v in expected.items():
                if isinstance(v, dict) and "max" in v:
                    if actual.get(k, 0) > v["max"]:
                        return False
                elif isinstance(v, list):
                    if actual.get(k) not in v:
                        return False
            return True
        return False
    except:
        return False

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return {}

def save_history(history):
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

# -------------------------------
# QA Testing Loop
# -------------------------------
previous_failures = set()

def run_qa_loop():
    global previous_failures
    if not os.path.exists(JSON_INPUT_FILE):
        print("Missing", JSON_INPUT_FILE)
        return

    with open(JSON_INPUT_FILE, "r") as f:
        base_checklist = json.load(f)

    history = load_history()

    while True:
        current_failures = set()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        for module in base_checklist:
            for test in module["tests"]:
                if test.get("automation_type") != "Automated":
                    test.setdefault("pass_fail", None)
                    test.setdefault("notes", "")
                    continue

                endpoint = fill_placeholders(test["api_endpoint"], PLACEHOLDERS)
                test_id = f"{module['module']}::{test['test_case']}"
                try:
                    resp = requests.get(f"{API_BASE_URL}{endpoint}", timeout=5)
                    response_json = resp.json() if resp.status_code == 200 else {}
                    passed = check_response(response_json, test.get("expected_response", {}), test.get("check_type"))
                    test["pass_fail"] = "PASS" if passed else "FAIL"
                    test["notes"] = "" if passed else f"Unexpected response: {response_json}"

                    if not passed:
                        current_failures.add(test_id)
                        if test_id not in previous_failures:
                            # Send notifications to all configured channels
                            send_slack_notification(module['module'], test['test_case'], test["notes"])
                            send_discord_notification(module['module'], test['test_case'], test["notes"])
                            send_teams_notification(module['module'], test['test_case'], test["notes"])
                            send_email_notification(module['module'], test['test_case'], test["notes"])
                    # update history
                    history.setdefault(test_id, [])
                    history[test_id].append({"timestamp": timestamp, "status": test["pass_fail"]})
                except Exception as e:
                    test["pass_fail"] = "FAIL"
                    test["notes"] = f"Error calling API: {e}"
                    current_failures.add(test_id)
                    if test_id not in previous_failures:
                        send_slack_notification(module['module'], test['test_case'], test["notes"])
                        send_discord_notification(module['module'], test['test_case'], test["notes"])
                        send_teams_notification(module['module'], test['test_case'], test["notes"])
                        send_email_notification(module['module'], test['test_case'], test["notes"])
                    history.setdefault(test_id, [])
                    history[test_id].append({"timestamp": timestamp, "status": "FAIL"})
                    print("Test exception:", e)

        previous_failures = current_failures

        with open(JSON_RESULTS_FILE, "w") as f:
            json.dump(base_checklist, f, indent=2)
        save_history(history)

        payload = {"results": base_checklist, "history": history, "timestamp": timestamp}
        socketio.emit("update", payload)
        print(f"Emitted update at {timestamp}")

        time.sleep(REFRESH_INTERVAL)

# -------------------------------
# Authentication Routes
# -------------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == DASHBOARD_USERNAME and password == DASHBOARD_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('index'))
        return render_template('login.html', error="Invalid credentials")
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

# -------------------------------
# Protected Routes
# -------------------------------
@app.route('/')
@login_required
def index():
    return render_template("index.html")

@app.route('/api/qa-data')
@login_required
def get_qa_data():
    if os.path.exists(JSON_RESULTS_FILE) and os.path.exists(HISTORY_FILE):
        with open(JSON_RESULTS_FILE, "r") as f:
            results = json.load(f)
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)
        return jsonify({"results": results, "history": history, "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})
    return jsonify({"error": "No data available"})

@app.route('/metrics')
def metrics():
    """Prometheus-compatible metrics endpoint"""
    # Load current data
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    websocket_connections = 0  # This would need to be tracked

    if os.path.exists(JSON_RESULTS_FILE):
        with open(JSON_RESULTS_FILE, "r") as f:
            results = json.load(f)
            for module in results:
                for test in module["tests"]:
                    total_tests += 1
                    if test.get("pass_fail") == "PASS":
                        passed_tests += 1
                    elif test.get("pass_fail") == "FAIL":
                        failed_tests += 1

    # Generate Prometheus metrics
    metrics_output = f"""# HELP qa_tests_total Total number of QA tests executed
# TYPE qa_tests_total counter
qa_tests_total{{status="total"}} {total_tests}
qa_tests_total{{status="pass"}} {passed_tests}
qa_tests_total{{status="fail"}} {failed_tests}

# HELP qa_websocket_connections Number of active WebSocket connections
# TYPE qa_websocket_connections gauge
qa_websocket_connections {websocket_connections}

# HELP qa_up Service availability
# TYPE qa_up gauge
qa_up 1

# HELP qa_last_test_timestamp Unix timestamp of last test execution
# TYPE qa_last_test_timestamp gauge
qa_last_test_timestamp {int(time.time())}
"""

    return metrics_output, 200, {'Content-Type': 'text/plain; charset=utf-8'}

# -------------------------------
# WebSocket Events
# -------------------------------
@socketio.on("connect")
def on_connect():
    if REQUIRE_AUTH and not session.get('logged_in'):
        disconnect()
        return
    print("Client connected")
    emit('status', {'message': 'Connected to QA Dashboard'})

@socketio.on("disconnect")
def on_disconnect():
    print("Client disconnected")

if __name__ == "__main__":
    print("Starting Enhanced QA Dashboard Server...")
    print(f"Authentication: {'Enabled' if REQUIRE_AUTH else 'Disabled'}")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Refresh Interval: {REFRESH_INTERVAL}s")

    # Start background QA loop
    socketio.start_background_task(target=run_qa_loop)

    # Run server
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)