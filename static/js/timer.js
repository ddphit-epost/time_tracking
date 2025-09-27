    const stopBtn = document.getElementById('stop-btn');
    const timeline = document.getElementById('timeline');

    // --- State ---
    let timerInterval = null;
    let currentTimerId = null;
    let projectsData = [];
    const API_URL = 'http://127.0.0.1:5000/api';

    // --- Functions ---

    const fetchAndRenderTimeline = async () => {
        try {
            const response = await fetch(`${API_URL}/time-entries`);
            if (!response.ok) throw new Error('Failed to fetch timeline');
            const entries = await response.json();

            timeline.innerHTML = ''; // Clear previous entries
            const todayEntries = entries.filter(entry => {
                const entryDate = new Date(entry.start_time + 'Z');
                const today = new Date();
                return entryDate.getFullYear() === today.getFullYear() &&
                       entryDate.getMonth() === today.getMonth() &&
                       entryDate.getDate() === today.getDate();
            });

            if (todayEntries.length === 0) {
                timeline.innerHTML = '<p>No time entries logged today.</p>';
                return;
            }

            todayEntries.forEach(entry => {
                const project = projectsData.find(p => p.id === entry.project_id);
                const projectName = project ? project.name : 'No Project';

                const entryEl = document.createElement('div');
                entryEl.className = 'timeline-item';
                entryEl.innerHTML = `
                    <div class="timeline-item-title">${entry.title}</div>
                    <div class="timeline-item-project">${projectName}</div>
                    <div class="timeline-item-duration">${formatTime(entry.duration_seconds)}</div>
                    <div class="timeline-item-type ${entry.entry_type}">${entry.entry_type.toUpperCase()}</div>
                `;
                timeline.appendChild(entryEl);
            });

        } catch (error) {
            console.error('Error rendering timeline:', error);
            timeline.innerHTML = '<p class="error">Could not load timeline.</p>';
        }
    };

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return '00:00:00';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const updateTimerDisplay = (startTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const elapsedSeconds = Math.round((now - start) / 1000);
        timerDisplay.textContent = formatTime(elapsedSeconds);
    };

    const startTimer = async (entryType) => {
        const title = taskTitleInput.value.trim();
        if (!title) {
            alert('Please enter what you are working on.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/time-entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    project_id: projectSelect.value || null,
                    subproject_id: subprojectSelect.value || null,
                    entry_type: entryType
                })
            });

            if (response.status === 409) {
                alert('A timer is already running. Please stop it before starting a new one.');
                return;
            }
            if (!response.ok) throw new Error('Failed to start timer');

            const newEntry = await response.json();
            currentTimerId = newEntry.id;
            const startTime = new Date(newEntry.start_time + 'Z'); // Append Z for UTC

            timerInterval = setInterval(() => updateTimerDisplay(startTime), 1000);
            
            // Update UI
            startWorkBtn.style.display = 'none';
            startMeetingBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';

        } catch (error) {
            console.error('Error starting timer:', error);
        }
    };

    const stopTimer = async () => {
        if (!currentTimerId) return;

        try {
            const response = await fetch(`${API_URL}/time-entries/${currentTimerId}`, { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to stop timer');

            clearInterval(timerInterval);
            timerInterval = null;
            currentTimerId = null;
            timerDisplay.textContent = '00:00:00';

            // Update UI
            startWorkBtn.style.display = 'inline-block';
            startMeetingBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';

            fetchAndRenderTimeline(); // Refresh timeline

        } catch (error) {
            console.error('Error stopping timer:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${API_URL}/projects`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            projectsData = await response.json();
            populateProjects(projectsData);
            // Now that we have projects, we can render the timeline with correct project names
            fetchAndRenderTimeline();
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const populateProjects = (projects) => {
        projectSelect.innerHTML = '<option value="">اختر مشروعًا</option>';
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.name;
            projectSelect.appendChild(option);
        });
    };

    const populateSubprojects = (projectId) => {
        subprojectSelect.innerHTML = '<option value="">اختر مشروعًا فرعيًا</option>';
        if (!projectId) return;

        const project = projectsData.find(p => p.id == projectId);
        if (project && project.subprojects) {
            project.subprojects.forEach(sp => {
                const option = document.createElement('option');
                option.value = sp.id;
                option.textContent = sp.name;
                subprojectSelect.appendChild(option);
            });
        }
    };

    // --- Event Listeners ---
    startWorkBtn.addEventListener('click', () => startTimer('work'));
    startMeetingBtn.addEventListener('click', () => startTimer('meeting'));
    stopBtn.addEventListener('click', stopTimer);
    projectSelect.addEventListener('change', (e) => populateSubprojects(e.target.value));

    // --- Initial Load ---
    fetchProjects(); // This will also trigger the initial timeline render
