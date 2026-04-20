from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-change-me')

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///tasks.db')
# Render uses postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Task(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    text       = db.Column(db.String(200), nullable=False)
    completed  = db.Column(db.Boolean, default=False)
    priority   = db.Column(db.String(10), default='medium')
    due_date   = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reminders  = db.relationship('Reminder', backref='task', cascade='all, delete-orphan')


class Reminder(db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    task_id       = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    reminder_time = db.Column(db.String(30), nullable=False)
    message       = db.Column(db.String(200), default='')


with app.app_context():
    db.create_all()


OPENWEATHER_KEY = os.getenv('OPENWEATHER_API_KEY')


def get_weather(city='Kahului'):
    if not OPENWEATHER_KEY:
        return None
    try:
        resp = requests.get(
            'https://api.openweathermap.org/data/2.5/weather',
            params={'q': city, 'appid': OPENWEATHER_KEY, 'units': 'imperial'},
            timeout=5,
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                'city':        data['name'],
                'temperature': data['main']['temp'],
                'conditions':  data['weather'][0]['description'],
                'humidity':    data['main']['humidity'],
                'wind_speed':  data['wind']['speed'],
            }
    except requests.exceptions.RequestException:
        pass
    return None


def calc_stats(tasks):
    total     = len(tasks)
    completed = sum(1 for t in tasks if t.completed)
    pending   = total - completed
    pct       = round((completed / total) * 100, 1) if total else 0
    return {
        'total_tasks':          total,
        'completed_tasks':      completed,
        'pending_tasks':        pending,
        'completion_percentage': pct,
    }


@app.route('/')
def index():
    tasks     = Task.query.order_by(Task.created_at.desc()).all()
    reminders = Reminder.query.order_by(Reminder.reminder_time).all()
    weather   = get_weather()
    stats     = calc_stats(tasks)
    return render_template('index.html', tasks=tasks, weather=weather,
                           stats=stats, reminders=reminders)


@app.route('/add', methods=['POST'])
def add_task():
    text = request.form.get('task', '').strip()
    if not text:
        flash('Please enter a task.', 'error')
        return redirect(url_for('index'))
    priority = request.form.get('priority', 'medium')
    if priority not in ('high', 'medium', 'low'):
        priority = 'medium'
    due_date = request.form.get('due_date', '').strip() or None
    db.session.add(Task(text=text, priority=priority, due_date=due_date))
    db.session.commit()
    flash('Task added!', 'success')
    return redirect(url_for('index'))


@app.route('/complete/<int:task_id>')
def complete_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.completed = not task.completed
    db.session.commit()
    status = 'completed' if task.completed else 'marked as incomplete'
    flash(f'Task {status}!', 'success')
    return redirect(url_for('index'))


@app.route('/delete/all', methods=['POST'])
def delete_all_tasks():
    Task.query.delete()
    db.session.commit()
    flash('All tasks deleted!', 'success')
    return redirect(url_for('index'))


@app.route('/delete/<int:task_id>')
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    flash('Task deleted!', 'success')
    return redirect(url_for('index'))


@app.route('/set_reminder', methods=['POST'])
def set_reminder():
    task_id       = request.form.get('task_id', type=int)
    reminder_time = request.form.get('reminder_time', '').strip()
    message       = request.form.get('message', '').strip()
    if not task_id or not reminder_time:
        flash('Missing reminder details.', 'error')
        return redirect(url_for('index'))
    db.session.add(Reminder(task_id=task_id, reminder_time=reminder_time, message=message))
    db.session.commit()
    flash('Reminder set!', 'success')
    return redirect(url_for('index'))


@app.route('/weather', methods=['POST'])
def update_weather():
    city      = request.form.get('city', 'Kahului').strip() or 'Kahului'
    tasks     = Task.query.order_by(Task.created_at.desc()).all()
    reminders = Reminder.query.order_by(Reminder.reminder_time).all()
    weather   = get_weather(city)
    stats     = calc_stats(tasks)
    return render_template('index.html', tasks=tasks, weather=weather,
                           stats=stats, reminders=reminders)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
