document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const tasksContainer = document.getElementById('tasks-container');
    const searchInput = document.getElementById('search-input');
    const filterBtn = document.getElementById('filter-btn');
    const sortBtn = document.getElementById('sort-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editingIndex = null;
    let sortDirection = 'asc';

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = (tasksToRender = tasks) => {
        tasksContainer.innerHTML = '';
        if (tasksToRender.length === 0) {
            tasksContainer.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center p-4 text-gray-500">Tidak ada task saat ini.</td>
                </tr>
            `;
        } else {
            tasksToRender.forEach((task) => {
                const formattedDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('id-ID') : 'No due date';
                const statusClass = task.completed ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900';
                const statusText = task.completed ? 'Completed' : 'Pending';
                const rowClass = task.completed ? 'bg-gray-100 line-through' : 'even:bg-gray-50';
                
                const originalIndex = tasks.findIndex(t => t.text === task.text && t.dueDate === task.dueDate);

                const newTaskRow = `
                    <tr class="${rowClass} focus-within:bg-gray-50 transition-colors" data-index="${originalIndex}">
                        <td class="p-4">${task.text}</td>
                        <td class="p-4 text-center whitespace-nowrap">${formattedDate}</td>
                        <td class="p-4 text-center">
                            <span class="inline-block ${statusClass} font-semibold py-1 px-3 rounded-full text-xs select-none" aria-label="${statusText} task">${statusText}</span>
                        </td>
                        <td class="p-4 text-center space-x-2 text-white select-none">
                            <button aria-label="Edit task" title="Edit task" class="edit-btn inline-block bg-yellow-400 hover:bg-yellow-500 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400" type="button" data-index="${originalIndex}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                    <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                                </svg>
                            </button>
                            <button aria-label="Mark task completed" title="Mark task completed" class="complete-btn inline-block bg-green-400 hover:bg-green-500 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-green-400" type="button" data-index="${originalIndex}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <button aria-label="Delete task" title="Delete task" class="delete-btn inline-block bg-red-400 hover:bg-red-500 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-red-400" type="button" data-index="${originalIndex}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                `;
                tasksContainer.innerHTML += newTaskRow;
            });
        }
        updateSummary();
    };

    const updateSummary = () => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
        document.querySelector('.task-summary:nth-child(1) .text-2xl').textContent = totalTasks;
        document.querySelector('.task-summary:nth-child(2) .text-2xl').textContent = completedTasks;
        document.querySelector('.task-summary:nth-child(3) .text-2xl').textContent = pendingTasks;
        document.querySelector('.task-summary:nth-child(4) .text-2xl').textContent = `${progress}%`;
    };

    const validateInput = (text) => {
        const allowedCharsRegex = /^[a-zA-Z0-9\s.,!?'"()_@#$&*-]+$/;
        if (text.length < 3 || text.length > 100 || !allowedCharsRegex.test(text)) {
            alert('Nama task tidak valid. Minimal 3, maksimal 100 karakter, dan hanya boleh mengandung huruf, angka, dan tanda baca umum.');
            return false;
        }
        return true;
    };
    
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        const taskDate = dateInput.value;
    
        if (taskText === '') {
            alert('Nama task tidak boleh kosong!');
            return;
        }
    
        if (!validateInput(taskText)) {
            return;
        }
    
        if (editingIndex !== null) {
            tasks[editingIndex].text = taskText;
            tasks[editingIndex].dueDate = taskDate;
            editingIndex = null;
            addTaskBtn.textContent = 'Tambah Task';
        } else {
            tasks.push({ text: taskText, dueDate: taskDate, completed: false });
        }
    
        saveTasks();
        renderTasks();
        taskInput.value = '';
        dateInput.value = '';
    });
    
    tasksContainer.addEventListener('click', (event) => {
        const target = event.target;
        const button = target.closest('button');
        if (!button) return;
    
        const index = parseInt(button.dataset.index);
    
        if (button.classList.contains('delete-btn')) {
            if (confirm('Apakah Anda yakin ingin menghapus task ini?')) {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            }
        } else if (button.classList.contains('complete-btn')) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        } else if (button.classList.contains('edit-btn')) {
            editingIndex = index;
            taskInput.value = tasks[index].text;
            dateInput.value = tasks[index].dueDate;
            addTaskBtn.textContent = 'Simpan Edit';
        }
    });

    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus SEMUA task? Tindakan ini tidak bisa dibatalkan.')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredTasks = tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm) ||
            (task.dueDate && task.dueDate.toLowerCase().includes(searchTerm))
        );
        renderTasks(filteredTasks);
    });
    
    sortBtn.addEventListener('click', () => {
        if (sortDirection === 'asc') {
            tasks.sort((a, b) => a.text.localeCompare(b.text));
            sortDirection = 'desc';
        } else {
            tasks.sort((a, b) => b.text.localeCompare(a.text));
            sortDirection = 'asc';
        }
        renderTasks();
    });
    
    filterBtn.addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        const filteredTasks = tasks.filter(task => task.dueDate === today);
        renderTasks(filteredTasks);
    });

    renderTasks();
});