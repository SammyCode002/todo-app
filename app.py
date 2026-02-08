from flask import Flask, render_template, request, redirect, url_for, flash
import json
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# Simple JSON file storage
DATA_FILE = 'tasks.json'

def load_tasks():
    """Load tasks from JSON file."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_tasks(tasks):
    """Save tasks to JSON file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)

@app.route('/')
def index():
    """Display all tasks."""
    tasks = load_tasks()
    return render_template('index.html', tasks=tasks)

@app.route('/add', methods=['POST'])
def add_task():
    """Add a new task."""
    task_text = request.form.get('task', '').strip()
    
    if not task_text:
        flash('Please enter a task description.', 'error')
        return redirect(url_for('index'))
    
    tasks = load_tasks()
    new_task = {
        'id': len(tasks) + 1,
        'text': task_text,
        'completed': False
    }
    tasks.append(new_task)
    save_tasks(tasks)
    
    flash('Task added successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/complete/<int:task_id>')
def complete_task(task_id):
    """Toggle task completion status."""
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
    """Delete a task."""
    tasks = load_tasks()
    tasks = [task for task in tasks if task['id'] != task_id]
    save_tasks(tasks)
    
    flash('Task deleted!', 'success')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
