# To-Do List Application

A productivity web app built with Flask that integrates with four microservices for weather data, task statistics, reminders, and data export.

## Features

- **Task Management** - Add, complete, and delete tasks
- **Weather Widget** - Real-time weather data for any city via OpenWeatherMap API
- **Task Statistics** - Productivity stats including completion percentage and task counts
- **Reminders** - Set and view upcoming task reminders with date/time
- **Data Export** - Export tasks to JSON or plain text format
- **Help Panel** - Built-in instructions for new users
- **Dark Theme** - OSU Beavers orange and black styling

## Architecture

The main program communicates with four independent microservices through HTTP requests. No direct function calls between programs.

```
Main Program (port 5000)
    |
    |-- Data Export Service (port 5001) - Small Pool
    |-- Task Statistics Service (port 5002) - Big Pool
    |-- Reminder Service (port 5003) - Big Pool
    |-- Weather Service (port 5004) - Big Pool
```

## Project Structure

```
todo_app_CS361/
├── app.py                          # Main Flask application
├── tasks.json                      # Task storage (auto-created)
├── requirements.txt                # Python dependencies
├── .gitignore                      # Excludes .env files
├── templates/
│   └── index.html                  # HTML template with all widgets
├── weather_service/
│   ├── app.py                      # Weather microservice
│   └── .env                        # API key (not tracked)
├── task_statistics_service/
│   └── app.py                      # Task statistics microservice
├── reminder_service/
│   └── app.py                      # Reminder microservice
└── README.md
```

## Setup

1. Make sure you have Python 3.7+ installed

2. Install dependencies

```
pip install flask requests python-dotenv
```

3. Set up the Weather Service API key

Create a `.env` file in `weather_service/` with your OpenWeatherMap API key:

```
OPENWEATHER_API_KEY=your_api_key_here
```

Get a free key at https://openweathermap.org/api

4. Start all services (each in a separate terminal)

```
# Terminal 1 - Data Export (port 5001)
cd data-export-microservice
python app.py

# Terminal 2 - Task Statistics (port 5002)
cd task_statistics_service
python app.py

# Terminal 3 - Reminder Service (port 5003)
cd reminder_service
python app.py

# Terminal 4 - Weather Service (port 5004)
cd weather_service
python app.py

# Terminal 5 - Main App (port 5000)
python app.py
```

5. Open http://localhost:5000 in your browser

## Microservices

### Data Export (Small Pool) - Port 5001

Exports task data to JSON or plain text format.

- `POST /export` - Export tasks with `data` and `format` parameters

### Weather Service (Big Pool) - Port 5004

Returns current weather data for any city using OpenWeatherMap API.

- `GET /weather?city=Seattle` - Get weather for a city

### Task Statistics (Big Pool) - Port 5002

Calculates productivity stats from a task list.

- `POST /stats` - Get total, completed, pending, and completion percentage
- `POST /stats/breakdown` - Get tasks separated by status

### Reminder Service (Big Pool) - Port 5003

Set and retrieve upcoming task reminders.

- `POST /reminder` - Set a reminder with task_id, reminder_time, message
- `GET /reminders` - Get all reminders sorted by time
- `GET /reminders?task_id=1` - Get reminders for a specific task

## Tech Stack

- Python, Flask
- HTML, CSS, Jinja2
- OpenWeatherMap API
- JSON file storage

## Developer

Samuel Dameg

## License

MIT License
