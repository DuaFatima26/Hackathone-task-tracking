// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCAnHygODaxm6JrFlyNhimgXaUtEt1Jvv8",
    authDomain: "task-tracking-app-56fe8.firebaseapp.com",
    projectId: "task-tracking-app-56fe8",
    storageBucket: "task-tracking-app-56fe8.appspot.com",
    messagingSenderId: "698725088954",
    appId: "1:698725088954:web:d7f10d2843d4676ef0cc83",
    measurementId: "G-SEBLZBDCWJ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();


auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "../index.html";
    }
});


function logout() {
    auth.signOut().then(() => {
        window.location.href = "../index.html";
    }).catch((error) => {
        console.error("Logout error:", error);
    });
}


function addTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const assignedTo = document.getElementById('assigned-to').value;

    if (title && description && assignedTo) {
        const newTaskRef = db.ref('tasks').push();
        const taskData = {
            title: title,
            description: description,
            assignedTo: assignedTo,
            status: 'To Do',
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };

        newTaskRef.set(taskData)
            .then(() => {
                document.getElementById('task-title').value = '';
                document.getElementById('task-description').value = '';
                document.getElementById('assigned-to').value = '';
                
                const btn = document.querySelector('.add-task-btn');
                btn.innerHTML = '<i class="fas fa-check"></i> Task Added!';
                btn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
                    btn.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
                }, 2000);
            })
            .catch(error => {
                console.error("Error adding task:", error);
                alert("Error adding task: " + error.message);
            });
    } else {
        const form = document.querySelector('.task-form');
        form.style.animation = 'shake 0.5s';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
        alert("Please fill in all fields");
    }
}


function editTask(taskId, currentTask) {
    const title = prompt("Enter new title:", currentTask.title);
    if (title === null) return;
    
    const description = prompt("Enter new description:", currentTask.description);
    if (description === null) return;
    
    const assignedTo = prompt("Enter new assignee:", currentTask.assignedTo);
    if (assignedTo === null) return;

    if (title && description && assignedTo) {
        db.ref('tasks/' + taskId).update({
            title: title,
            description: description,
            assignedTo: assignedTo
        }).then(() => {
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.style.transform = 'scale(1.05)';
                taskElement.style.boxShadow = '0 0 15px rgba(72, 149, 239, 0.5)';
                setTimeout(() => {
                    taskElement.style.transform = '';
                    taskElement.style.boxShadow = '';
                }, 500);
            }
        }).catch(error => {
            console.error("Error updating task:", error);
            alert("Error updating task: " + error.message);
        });
    }
}


function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                db.ref('tasks/' + taskId).remove()
                    .catch(error => {
                        console.error("Error deleting task:", error);
                        alert("Error deleting task: " + error.message);
                    });
            }, 300);
        } else {
            db.ref('tasks/' + taskId).remove()
                .catch(error => {
                    console.error("Error deleting task:", error);
                    alert("Error deleting task: " + error.message);
                });
        }
    }
}


function moveTask(taskId, newStatus) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        taskElement.style.transform = 'scale(0.95)';
        taskElement.style.opacity = '0.5';
    }
    
    db.ref('tasks/' + taskId).update({
        status: newStatus
    }).then(() => {
        if (taskElement) {
            // Add success animation with the help of Ai
            taskElement.style.transform = 'scale(1)';
            taskElement.style.opacity = '1';
            taskElement.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.5)';
            setTimeout(() => {
                taskElement.style.boxShadow = '';
            }, 1000);
        }
    }).catch(error => {
        console.error("Error moving task:", error);
        alert("Error moving task: " + error.message);
        if (taskElement) {
            taskElement.style.transform = '';
            taskElement.style.opacity = '';
        }
    });
}


function displayTasks(tasks, searchTerm = '') {
    const todoContainer = document.querySelector('#todo-tasks .tasks-container');
    const inProgressContainer = document.querySelector('#inprogress-tasks .tasks-container');
    const doneContainer = document.querySelector('#done-tasks .tasks-container');

    todoContainer.innerHTML = '';
    inProgressContainer.innerHTML = '';
    doneContainer.innerHTML = '';

    if (!tasks) {
        todoContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No tasks to display</p></div>';
        inProgressContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No tasks in progress</p></div>';
        doneContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No completed tasks</p></div>';
        return;
    }

    let hasResults = false;
    const searchTermLower = searchTerm.toLowerCase();

    Object.entries(tasks).forEach(([taskId, task]) => {
        const matchesSearch = searchTerm === '' || 
            (task.title && task.title.toLowerCase().includes(searchTermLower)) ||
            (task.description && task.description.toLowerCase().includes(searchTermLower)) ||
            (task.assignedTo && task.assignedTo.toLowerCase().includes(searchTermLower));

        if (!matchesSearch) return;

        hasResults = true;
        const taskElement = createTaskElement(taskId, task);
        
        switch(task.status) {
            case 'To Do':
                todoContainer.appendChild(taskElement);
                break;
            case 'In Progress':
                inProgressContainer.appendChild(taskElement);
                break;
            case 'Done':
                doneContainer.appendChild(taskElement);
                break;
        }
    });

    if (searchTerm && !hasResults) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = '<i class="fas fa-search"></i><p>No tasks found matching your search</p>';
        
        todoContainer.appendChild(noResultsDiv.cloneNode(true));
        inProgressContainer.appendChild(noResultsDiv.cloneNode(true));
        doneContainer.appendChild(noResultsDiv.cloneNode(true));
    } else if (!hasResults) {
        todoContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No tasks to display</p></div>';
        inProgressContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No tasks in progress</p></div>';
        doneContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No completed tasks</p></div>';
    }

  
    setupDragAndDrop();
}


function createTaskElement(taskId, task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task ${task.status.toLowerCase().replace(' ', '')}`;
    taskElement.setAttribute('data-task-id', taskId);
    taskElement.draggable = true;
    
    taskElement.innerHTML = `
        <div class="status-badge">${task.status}</div>
        <h3>${task.title || 'Untitled Task'}</h3>
        <p>${task.description || 'No description'}</p>
        <p><strong><i class="fas fa-user"></i> Assigned to:</strong> ${task.assignedTo || 'Unassigned'}</p>
        <div class="task-actions"></div>
    `;
    
    const actionsContainer = taskElement.querySelector('.task-actions');
    
    if (task.status === 'To Do') {
        addActionButton(actionsContainer, 'Start Progress', () => moveTask(taskId, 'In Progress'), 'fas fa-play', 'move-btn');
    } else if (task.status === 'In Progress') {
        addActionButton(actionsContainer, 'Mark Done', () => moveTask(taskId, 'Done'), 'fas fa-check', 'move-btn');
        addActionButton(actionsContainer, 'Move Back', () => moveTask(taskId, 'To Do'), 'fas fa-undo', 'move-btn');
    } else if (task.status === 'Done') {
        addActionButton(actionsContainer, 'Reopen', () => moveTask(taskId, 'In Progress'), 'fas fa-redo', 'move-btn');
    }
    
    addActionButton(actionsContainer, 'Edit', () => editTask(taskId, task), 'fas fa-edit', 'edit-btn');
    addActionButton(actionsContainer, 'Delete', () => deleteTask(taskId), 'fas fa-trash', 'delete-btn');
    
    return taskElement;
}


function addActionButton(container, text, onClick, iconClass, btnClass) {
    const button = document.createElement('button');
    button.className = `action-btn ${btnClass}`;
    button.innerHTML = `<i class="${iconClass}"></i> ${text}`;
    button.onclick = onClick;
    container.appendChild(button);
}

// Drag and Drop functionality with the little bit help of ai
function setupDragAndDrop() {
    const tasks = document.querySelectorAll('.task');
    const containers = document.querySelectorAll('.tasks-container');
    
    tasks.forEach(task => {
        task.draggable = true;
        
        task.addEventListener('dragstart', (e) => {
            task.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.getAttribute('data-task-id'));
            e.dataTransfer.effectAllowed = 'move';
        });
        
        task.addEventListener('dragend', () => {
            task.classList.remove('dragging');
        });
    });
    
    containers.forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            container.classList.add('drop-target', 'hovered');
            
            if (container.closest('#todo-tasks')) {
                container.classList.add('todo');
            } else if (container.closest('#inprogress-tasks')) {
                container.classList.add('inprogress');
            } else if (container.closest('#done-tasks')) {
                container.classList.add('done');
            }
            
            if (afterElement == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }
        });
        
        container.addEventListener('dragleave', () => {
            container.classList.remove('drop-target', 'hovered', 'todo', 'inprogress', 'done');
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drop-target', 'hovered', 'todo', 'inprogress', 'done');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const draggedTask = document.querySelector(`[data-task-id="${taskId}"]`);
            
            if (draggedTask && container !== draggedTask.parentNode) {
                let newStatus = 'To Do';
                if (container.closest('#inprogress-tasks')) {
                    newStatus = 'In Progress';
                } else if (container.closest('#done-tasks')) {
                    newStatus = 'Done';
                }
                
                moveTask(taskId, newStatus);
            }
        });
    });
}


function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Initialize the app
window.onload = function() {
    // Add custom animations with the help of Ai
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: scale(0.9); }
        }
    `;
    document.head.appendChild(style);
    
   
    db.ref('tasks').on('value', (snapshot) => {
        const searchInput = document.getElementById('task-search');
        displayTasks(snapshot.val(), searchInput ? searchInput.value : '');
    });

 
    const searchInput = document.getElementById('task-search');
    const clearSearchBtn = document.getElementById('clear-search');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            db.ref('tasks').once('value').then((snapshot) => {
                displayTasks(snapshot.val(), e.target.value);
            });
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                db.ref('tasks').once('value').then((snapshot) => {
                    displayTasks(snapshot.val(), '');
                });
            }
        });
    }
};