# app.py
# تطبيق Flask الرئيسي

from flask import Flask, render_template, jsonify, request, make_response
import io
import csv
from flask_cors import CORS
from models import db, Project, Subproject, Task, TimeEntry
from datetime import datetime

app = Flask(__name__)

# Load configuration from config.py
app.config.from_pyfile('config.py')

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": "*"}})
db.init_app(app)

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

# --- HTML Page Routes ---

@app.route('/')
def index():
    return render_template('timer.html')

@app.route('/reports')
def reports():
    return render_template('reports.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/tasks')
def tasks():
    return render_template('tasks.html')

# --- API Routes ---

# --- API Routes for Projects ---

@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict() for p in projects])

@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Project name is required'}), 400
    
    new_project = Project(name=data['name'], description=data.get('description'))
    db.session.add(new_project)
    db.session.commit()
    
    return jsonify(new_project.to_dict()), 201

@app.route('/api/projects/<int:id>', methods=['DELETE'])
def delete_project(id):
    project = Project.query.get_or_404(id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted'}), 200

@app.route('/api/subprojects', methods=['POST'])
def create_subproject():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('project_id'):
        return jsonify({'error': 'Subproject name and project_id are required'}), 400

    project = Project.query.get_or_404(data['project_id'])
    new_subproject = Subproject(name=data['name'], description=data.get('description'), project_id=project.id)
    db.session.add(new_subproject)
    db.session.commit()

    return jsonify(new_subproject.to_dict()), 201

# --- API Routes for Tasks ---

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Task title is required'}), 400
    
    new_task = Task(title=data['title'], description=data.get('description'))
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify(new_task.to_dict()), 201

@app.route('/api/tasks/<int:id>/toggle', methods=['PUT'])
def toggle_task(id):
    task = Task.query.get_or_404(id)
    if task.status == 'active':
        task.status = 'completed'
        task.completed_at = datetime.utcnow()
    else:
        task.status = 'active'
        task.completed_at = None
    db.session.commit()
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200


# --- API Routes for Time Entries ---

@app.route('/api/time-entries', methods=['GET'])
def get_time_entries():
    entries = TimeEntry.query.order_by(TimeEntry.start_time.desc()).all()
    return jsonify([entry.to_dict() for entry in entries])

@app.route('/api/time-entries', methods=['POST'])
def create_time_entry():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Entry title is required'}), 400

    # Check for an existing running timer
    running_timer = TimeEntry.query.filter_by(end_time=None).first()
    if running_timer:
        return jsonify({'error': 'A timer is already running'}), 409 # Conflict

    new_entry = TimeEntry(
        title=data['title'],
        project_id=data.get('project_id') or None,
        subproject_id=data.get('subproject_id') or None,
        entry_type=data.get('entry_type', 'work'),
        start_time=datetime.utcnow()
    )
    db.session.add(new_entry)
    db.session.commit()
    return jsonify(new_entry.to_dict()), 201

@app.route('/api/time-entries/<int:id>', methods=['PUT'])
def stop_time_entry(id):
    entry = TimeEntry.query.get_or_404(id)
    if entry.end_time:
        return jsonify({'error': 'Timer is already stopped'}), 400

    entry.end_time = datetime.utcnow()
    duration = entry.end_time - entry.start_time
    entry.duration_seconds = int(duration.total_seconds())
    db.session.commit()
    return jsonify(entry.to_dict())


# --- API Routes for Reports ---

def get_filtered_entries(args):
    query = TimeEntry.query

    start_date_str = args.get('start_date')
    if start_date_str:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        query = query.filter(TimeEntry.start_time >= start_date)

    end_date_str = args.get('end_date')
    if end_date_str:
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        query = query.filter(TimeEntry.start_time <= end_date)

    project_id = args.get('project_id')
    if project_id:
        query = query.filter(TimeEntry.project_id == project_id)
    
    return query.order_by(TimeEntry.start_time.desc()).all()

@app.route('/api/reports', methods=['GET'])
def get_report_data():
    entries = get_filtered_entries(request.args)
    total_duration = sum(e.duration_seconds for e in entries)
    
    report = {
        'entries': [e.to_dict() for e in entries],
        'total_duration_seconds': total_duration,
        'total_entries': len(entries)
    }
    return jsonify(report)

@app.route('/api/reports/export', methods=['GET'])
def export_report():
    entries = get_filtered_entries(request.args)
    
    # Use an in-memory text buffer
    si = io.StringIO()
    cw = csv.writer(si)

    # Write header
    headers = ['ID', 'Title', 'Project ID', 'Start Time', 'End Time', 'Duration (seconds)']
    cw.writerow(headers)

    # Write data
    for entry in entries:
        cw.writerow([
            entry.id,
            entry.title,
            entry.project_id,
            entry.start_time.strftime('%Y-%m-%d %H:%M:%S'),
            entry.end_time.strftime('%Y-%m-%d %H:%M:%S') if entry.end_time else '',
            entry.duration_seconds
        ])
    
    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=time_report.csv"
    output.headers["Content-type"] = "text/csv"
    return output


if __name__ == '__main__':
    app.run(debug=True, port=5000)
