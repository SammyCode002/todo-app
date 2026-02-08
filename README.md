# To-Do List Application
CS361 - Assignment 5: Milestone #1  
Samuel Dameg

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

---

## Inclusivity Heuristics Mapping

| IH# | Heuristic | Where It's Reflected |
|-----|-----------|---------------------|
| 1 | Explain benefits | App description at top + success messages + empty state text |
| 2 | Explain costs | Error message for empty input ("Please enter a task description") |
| 3 | Gather info (no more, no less) | Task counter shows "X of Y tasks remaining" + status labels |
| 4 | Familiar features | Standard checkbox for completion (like other to-do apps) |
| 5 | Undo/backtracking | Can uncheck a task to mark it pending again |
| 6 | Explicit path | Clear "New Task" label + "Add Task" button |
| 7 | Try different approaches | "Press Enter or click Add Task to add" hint text |
| 8 | Tinker mindfully | Confirmation popup before deleting a task |

---

## User Stories (3 Completed)

### User Story 1: Add a Task
**As a user, I can add a task so I can keep track of things I need to do.**

Acceptance Criteria:
- Given I'm on the main page
- When I type a task and click "Add Task" (or press Enter)
- Then the task appears in my list with a success message

### User Story 2: Complete a Task
**As a user, I can mark a task as complete so I can track my progress.**

Acceptance Criteria:
- Given I have a task in my list
- When I click the checkbox
- Then the task shows as "Done" with strikethrough

### User Story 3: Delete a Task
**As a user, I can delete a task so I can remove items I no longer need.**

Acceptance Criteria:
- Given I have a task in my list
- When I click "Delete" and confirm
- Then the task is removed from my list

---

## Quality Attributes (3)

### 1. Usability
**Requirement:** Each Inclusivity Heuristic is reflected in the UI.  
**How it's met:** All 8 IH are implemented (see table above).

### 2. Responsiveness  
**Requirement:** Page loads in under 2 seconds.  
**How it's met:** Simple HTML/CSS, no heavy frameworks. Page loads instantly.

### 3. Maintainability
**Requirement:** Code is organized and functions are short.  
**How it's met:** Each route function does one thing, clear naming, organized file structure.

---

## License

MIT License - Free to use for educational purposes.
