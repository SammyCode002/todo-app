# To-Do List Application

A simple, accessible to-do list web application built with Flask.

## Features (Sprint 1)

- ✅ **Add Task** - Create new tasks with a simple form
- ✅ **View Tasks** - See all your tasks in a clean list
- ✅ **Complete Task** - Mark tasks as done (with visual feedback)
- ✅ **Delete Task** - Remove tasks you no longer need

## Setup Instructions

### 1. Make sure you have Python installed

```bash
python --version
```

You need Python 3.7 or higher.

### 2. Create a virtual environment (recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the application

```bash
python app.py
```

### 5. Open in your browser

Go to: **http://127.0.0.1:5000**

## Project Structure

```
todo_app/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── tasks.json          # Task storage (created automatically)
├── templates/
│   └── index.html      # HTML template
└── README.md           # This file
```

## Quality Attributes Implemented

### Usability
- Clean, intuitive interface
- Clear labels on all form inputs
- Immediate feedback via flash messages
- Task count shows progress

### Reliability
- Tasks persist in JSON file
- Consistent display on every page load
- Error handling for empty task submission

### Accessibility
- Proper HTML labels for all inputs
- Keyboard navigation support (Tab, Enter)
- Skip link for screen reader users
- Visual indicators don't rely solely on color (✓ Done / ⏳ Pending labels)
- ARIA labels for interactive elements
- Sufficient color contrast

## Screenshots

(Add screenshots here for your assignment)

## License

MIT License - Free to use for educational purposes.
