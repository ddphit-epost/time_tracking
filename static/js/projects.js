document.addEventListener('DOMContentLoaded', () => {

    const addProjectForm = document.getElementById('add-project-form');
    const newProjectNameInput = document.getElementById('new-project-name');
    const projectsList = document.getElementById('projects-list');
    const API_URL = 'http://127.0.0.1:5000/api';

    // --- Functions ---

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${API_URL}/projects`);
            if (!response.ok) throw new Error('Network response was not ok');
            const projects = await response.json();
            renderProjects(projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
            projectsList.innerHTML = '<p class="error">Failed to load projects.</p>';
        }
    };

    const renderProjects = (projects) => {
        projectsList.innerHTML = ''; // Clear existing list
        if (projects.length === 0) {
            projectsList.innerHTML = '<p>No projects yet. Add one to get started!</p>';
            return;
        }

        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'card project-card';
            projectCard.innerHTML = `
                <div class="card-header">
                    <h3>${project.name}</h3>
                    <button class="btn-delete delete-project-btn" data-project-id="${project.id}">&times;</button>
                </div>
                <div class="card-body">
                    <ul class="subprojects-list">
                        ${project.subprojects.map(sp => `<li>${sp.name}</li>`).join('')}
                    </ul>
                    <form class="form-inline add-subproject-form" data-project-id="${project.id}">
                        <input type="text" class="new-subproject-name" placeholder="إضافة مشروع فرعي" required>
                        <button type="submit" class="btn btn-secondary">+</button>
                    </form>
                </div>
            `;
            projectsList.appendChild(projectCard);
        });

        // Add event listeners after rendering
        addEventListeners();
    };

    const addEventListeners = () => {
        // Delete project buttons
        document.querySelectorAll('.delete-project-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const projectId = e.target.dataset.projectId;
                if (confirm('Are you sure you want to delete this project and all its subprojects?')) {
                    try {
                        const response = await fetch(`${API_URL}/projects/${projectId}`, { method: 'DELETE' });
                        if (!response.ok) throw new Error('Failed to delete');
                        fetchProjects(); // Refresh list
                    } catch (error) {
                        console.error('Error deleting project:', error);
                    }
                }
            });
        });

        // Add subproject forms
        document.querySelectorAll('.add-subproject-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const projectId = e.target.dataset.projectId;
                const subprojectNameInput = e.target.querySelector('.new-subproject-name');
                const subprojectName = subprojectNameInput.value.trim();

                if (subprojectName) {
                    try {
                        const response = await fetch(`${API_URL}/subprojects`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: subprojectName, project_id: projectId })
                        });
                        if (!response.ok) throw new Error('Failed to add subproject');
                        subprojectNameInput.value = '';
                        fetchProjects(); // Refresh list
                    } catch (error) {
                        console.error('Error adding subproject:', error);
                    }
                }
            });
        });
    };

    // --- Initial Load ---

    // Add new project form handler
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = newProjectNameInput.value.trim();
        if (newName) {
            try {
                const response = await fetch(`${API_URL}/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName })
                });
                if (!response.ok) throw new Error('Failed to add project');
                newProjectNameInput.value = '';
                fetchProjects(); // Refresh list
            } catch (error) {
                console.error('Error adding project:', error);
            }
        }
    });

    // Fetch and render projects on page load
    fetchProjects();
});
