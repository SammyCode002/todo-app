"""
Task Statistics Service Microservice
Calculates productivity stats from a list of tasks.
Runs on port 5002.
"""

from flask import Flask, jsonify, request

app = Flask(__name__)


@app.post("/stats")
def get_stats():
    """Get task summary statistics."""
    data = request.get_json()

    if data is None:
        return jsonify({
            "error_code": "INVALID_JSON",
            "message": "Request body must be valid JSON"
        }), 400

    tasks = data.get("tasks", [])

    total = len(tasks)
    completed = sum(1 for t in tasks if t.get("completed", False))
    pending = total - completed

    if total == 0:
        percentage = 0
    else:
        percentage = round((completed / total) * 100, 1)

    return jsonify({
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "completion_percentage": percentage
    }), 200


@app.post("/stats/breakdown")
def get_breakdown():
    """Get tasks separated by status."""
    data = request.get_json()

    if data is None:
        return jsonify({
            "error_code": "INVALID_JSON",
            "message": "Request body must be valid JSON"
        }), 400

    tasks = data.get("tasks", [])

    for i, task in enumerate(tasks):
        if "title" not in task:
            return jsonify({
                "error_code": "MISSING_FIELD",
                "message": f"Task at index {i} is missing required field: title"
            }), 400

    completed_list = [t for t in tasks if t.get("completed", False)]
    pending_list = [t for t in tasks if not t.get("completed", False)]

    return jsonify({
        "completed_tasks": completed_list,
        "pending_tasks": pending_list
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
