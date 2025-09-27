document.addEventListener('DOMContentLoaded', () => {

    const addTaskForm = document.getElementById('add-task-form');
    const newTaskTitleInput = document.getElementById('new-task-title');
    const activeTasksList = document.getElementById('active-tasks-list');
    const completedTasksList = document.getElementById('completed-tasks-list');
    const API_URL = 'http://127.0.0.1:5000/api';

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/tasks`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const renderTasks = (tasks) => {
        activeTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        const activeTasks = tasks.filter(t => t.status === 'active');
        const completedTasks = tasks.filter(t => t.status === 'completed');

        if (activeTasks.length === 0) {
            activeTasksList.innerHTML = '<p>No active tasks.</p>';
        }
        activeTasks.forEach(task => {
            const taskEl = createTaskElement(task);
            activeTasksList.appendChild(taskEl);
        });

        if (completedTasks.length === 0) {
            completedTasksList.innerHTML = '<p>No completed tasks.</p>';
        }
        completedTasks.forEach(task => {
            const taskEl = createTaskElement(task);
            completedTasksList.appendChild(taskEl);
        });

        addEventListeners();
    };

    const createTaskElement = (task) => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.dataset.taskId = task.id;
        div.innerHTML = `
            <input type="checkbox" class="task-toggle" ${task.status === 'completed' ? 'checked' : ''}>
            <span class="task-title">${task.title}</span>
            <button class="btn-delete delete-task-btn">&times;</button>
        `;
        return div;
    };

    const addEventListeners = () => {
        document.querySelectorAll('.task-toggle').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                try {
                    await fetch(`${API_URL}/tasks/${taskId}/toggle`, { method: 'PUT' });
                    fetchTasks();
                } catch (error) {
                    console.error('Error toggling task:', error);
                }
            });
        });

        document.querySelectorAll('.delete-task-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                if (confirm('Are you sure you want to delete this task?')) {
                    try {
                        await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
                        fetchTasks();
                    } catch (error) {
                        console.error('Error deleting task:', error);
                    }
                }
            });
        });
    };

    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = newTaskTitleInput.value.trim();
        if (title) {
            try {
                const response = await fetch(`${API_URL}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title })
                });
                if (!response.ok) throw new Error('Failed to add task');
                newTaskTitleInput.value = '';
                fetchTasks();
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    });

    fetchTasks();
});
