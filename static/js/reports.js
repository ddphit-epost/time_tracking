// static/js/reports.js
// Reports page logic

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const projectSelect = document.getElementById('report-project-select');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-report-btn');
    const exportBtn = document.getElementById('export-csv-btn');
    const summaryContainer = document.getElementById('report-summary');
    const tableBody = document.querySelector('#report-table tbody');

    // --- State ---
    let projectsData = [];
    const API_URL = 'http://127.0.0.1:5000/api';

    // --- Functions ---

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return '00:00:00';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${API_URL}/projects`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            projectsData = await response.json();
            populateProjects(projectsData);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const populateProjects = (projects) => {
        projectSelect.innerHTML = '<option value="">الكل</option>';
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.name;
            projectSelect.appendChild(option);
        });
    };

    const generateReport = async () => {
        const params = new URLSearchParams();
        if (startDateInput.value) params.append('start_date', startDateInput.value);
        if (endDateInput.value) params.append('end_date', endDateInput.value);
        if (projectSelect.value) params.append('project_id', projectSelect.value);

        try {
            const response = await fetch(`${API_URL}/reports?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to generate report');
            const reportData = await response.json();
            renderReport(reportData);
            // Update export button link
            exportBtn.href = `${API_URL}/reports/export?${params.toString()}`;

        } catch (error) {
            console.error('Error generating report:', error);
            tableBody.innerHTML = '<tr><td colspan="5" class="error">Failed to load report.</td></tr>';
        }
    };

    const renderReport = (data) => {
        // Render summary
        summaryContainer.innerHTML = `
            <div class="card">
                <h4>إجمالي المدة</h4>
                <p>${formatTime(data.total_duration_seconds)}</p>
            </div>
            <div class="card">
                <h4>إجمالي الإدخالات</h4>
                <p>${data.total_entries}</p>
            </div>
        `;

        // Render table
        tableBody.innerHTML = '';
        if (data.entries.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No entries found for the selected filters.</td></tr>';
            return;
        }

        data.entries.forEach(entry => {
            const project = projectsData.find(p => p.id === entry.project_id);
            const projectName = project ? project.name : 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${entry.title}</td>
                <td>${projectName}</td>
                <td>${new Date(entry.start_time + 'Z').toLocaleString()}</td>
                <td>${entry.end_time ? new Date(entry.end_time + 'Z').toLocaleString() : 'Running...'}</td>
                <td>${formatTime(entry.duration_seconds)}</td>
            `;
            tableBody.appendChild(tr);
        });
    };

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generateReport);

    // --- Initial Load ---
    fetchProjects();
    generateReport(); // Also generate a default report for all entries on load
});
