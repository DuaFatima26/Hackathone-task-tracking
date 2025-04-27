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
       
        window.location.href = "index.html";
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
    }).catch(error => {
        console.error("Error moving task:", error);
        alert("Error moving task: " + error.message);
        if (taskElement) {
            taskElement.style.transform = '';
            taskElement.style.opacity = '';
        }
    });
}

function displayTasks(tasks) {
    const todoContainer = document.querySelector('#todo-tasks .tasks-container');
    const inProgressContainer = document.querySelector('#inprogress-tasks .tasks-container');
    const doneContainer = document.querySelector('#done-tasks .tasks-container');


    todoContainer.innerHTML = tasks ? '' : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No tasks to display</p></div>';
    inProgressContainer.innerHTML = tasks ? '' : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No tasks in progress</p></div>';
    doneContainer.innerHTML = tasks ? '' : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No completed tasks</p></div>';

    if (!tasks) return;

    Object.entries(tasks).forEach(([taskId, task]) => {
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
}


function createTaskElement(taskId, task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task ${task.status.toLowerCase().replace(' ', '')}`;
    taskElement.setAttribute('data-task-id', taskId);
    
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


window.onload = function() {
//    with the help of Ai
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
        displayTasks(snapshot.val());
    });
};