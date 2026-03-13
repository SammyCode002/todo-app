from flask import Flask, render_template, request, redirect, url_for, flash
import json
import os
import requests

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

DATA_FILE = 'tasks.json'

DATA_EXPORT_URL = "http://localhost:5001"
STATS_URL = "http://localhost:5002"
REMINDER_URL = "http://localhost:5003"
WEATHER_URL = "http://localhost:5004"


def load_tasks():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []


def save_tasks(tasks):
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)


def get_weather(city):
    try:
        response = requests.get(
            f"{WEATHER_URL}/weather",
            params={"city": city},
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
    except requests.exceptions.RequestException:
        pass
    return None


def get_stats(tasks):
    try:
        response = requests.post(
            f"{STATS_URL}/stats",
            json={"tasks": tasks},
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
    except requests.exceptions.RequestException:
        pass
    return None


def get_reminders():
    try:
        response = requests.get(
            f"{REMINDER_URL}/reminders",
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
    except requests.exceptions.RequestException:
        pass
    return []


def export_tasks(tasks, fmt):
    try:
        response = requests.post(
            f"{DATA_EXPORT_URL}/export",
            json={"data": {"tasks": tasks}, "format": fmt},
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
    except requests.exceptions.RequestException:
        pass
    return None


@app.route('/')
def index():
    tasks = load_tasks()
    weather = get_weather("Kahului")
    stats = get_stats(tasks)
    reminders = get_reminders()
    return render_template(
        'index.html',
        tasks=tasks,
        weather=weather,
        stats=stats,
        reminders=reminders
    )


@app.route('/add', methods=['POST'])
def add_task():
    task_text = request.form.get('task', '').strip()
    if not task_text:
        flash('Please enter a task description.', 'error')
        return redirect(url_for('index'))
    tasks = load_tasks()
    new_task = {
        'id': max([t['id'] for t in tasks], default=0) + 1,
        'text': task_text,
        'completed': False
    }
    tasks.append(new_task)
    save_tasks(tasks)
    flash('Task added successfully!', 'success')
    return redirect(url_for('index'))


@app.route('/complete/<int:task_id>')
def complete_task(task_id):
    tasks = load_tasks()
    for task in tasks:
        if task['id'] == task_id:
            task['completed'] = not task['completed']
            status = 'completed' if task['completed'] else 'marked as incomplete'
            flash(f'Task {status}!', 'success')
            break
    save_tasks(tasks)
    return redirect(url_for('index'))


@app.route('/delete/<int:task_id>')
def delete_task(task_id):
    tasks = load_tasks()
    tasks = [task for task in tasks if task['id'] != task_id]
    save_tasks(tasks)
    flash('Task deleted!', 'success')
    return redirect(url_for('index'))


@app.route('/set_reminder', methods=['POST'])
def set_reminder():
    task_id = request.form.get('task_id')
    reminder_time = request.form.get('reminder_time')
    message = request.form.get('message', '')
    try:
        response = requests.post(
            f"{REMINDER_URL}/reminder",
            json={
                "task_id": int(task_id),
                "reminder_time": reminder_time,
                "message": message
            },
            timeout=5
        )
        if response.status_code == 201:
            flash('Reminder set successfully!', 'success')
        else:
            flash('Failed to set reminder.', 'error')
    except requests.exceptions.RequestException:
        flash('Reminder service unavailable.', 'error')
    return redirect(url_for('index'))


@app.route('/export', methods=['POST'])
def export():
    fmt = request.form.get('format', 'json')
    tasks = load_tasks()
    result = export_tasks(tasks, fmt)
    if result:
        flash(f'Tasks exported to {fmt.upper()} successfully!', 'success')
    else:
        flash('Export service unavailable.', 'error')
    return redirect(url_for('index'))


@app.route('/weather', methods=['POST'])
def update_weather():
    city = request.form.get('city', 'Kahului').strip()
    if not city:
        city = 'Kahului'
    tasks = load_tasks()
    weather = get_weather(city)
    stats = get_stats(tasks)
    reminders = get_reminders()
    return render_template(
        'index.html',
        tasks=tasks,
        weather=weather,
        stats=stats,
        reminders=reminders
    )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
