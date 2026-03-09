"""
Reminder Service Microservice
Lets users set and retrieve upcoming task reminders.
Runs on port 5003.
"""

from datetime import datetime
from flask import Flask, jsonify, request

app = Flask(__name__)

reminders = []
next_id = 1


@app.post("/reminder")
def set_reminder():
    """Set a new task reminder."""
    global next_id

    data = request.get_json()

    if data is None:
        return jsonify({
            "error_code": "INVALID_JSON",
            "message": "Request body must be valid JSON"
        }), 400

    missing = []
    if "task_id" not in data:
        missing.append("task_id")
    if "reminder_time" not in data:
        missing.append("reminder_time")

    if missing:
        return jsonify({
            "error_code": "MISSING_FIELDS",
            "message": f"Missing required fields: {', '.join(missing)}"
        }), 400

    reminder = {
        "reminder_id": next_id,
        "task_id": data["task_id"],
        "reminder_time": data["reminder_time"],
        "message": data.get("message", "")
    }

    reminders.append(reminder)
    next_id += 1

    return jsonify(reminder), 201


@app.get("/reminders")
def get_reminders():
    """Get upcoming reminders, optionally filtered by task_id."""
    task_id = request.args.get("task_id")

    if task_id is not None:
        try:
            task_id = int(task_id)
        except ValueError:
            return jsonify({
                "error_code": "INVALID_PARAM",
                "message": "task_id must be an integer"
            }), 400

        filtered = [r for r in reminders if r["task_id"] == task_id]
    else:
        filtered = reminders

    sorted_reminders = sorted(filtered, key=lambda r: r["reminder_time"])

    return jsonify(sorted_reminders), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
