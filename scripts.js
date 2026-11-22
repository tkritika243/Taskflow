const API = "http://localhost:5000/api";

let token = localStorage.getItem("token") || "";

function showLogin() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function showRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
}

async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) showLogin();
    } catch (error) {
        alert("Server connection failed!");
    }
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        token = data.token;
        localStorage.setItem("token", token);

        document.getElementById("authSection").classList.add("hidden");
        document.getElementById("dashboard").classList.remove("hidden");

        loadTasks();
    } catch (error) {
        alert("Server connection failed!");
    }
}

function logout() {
    localStorage.removeItem("token");
    token = "";
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("authSection").classList.remove("hidden");
    showLogin();
}

async function addTask() {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;

    if (!title.trim()) {
        alert("Please enter task title");
        return;
    }

    const response = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDescription").value = "";
        loadTasks();
    } else {
        alert(data.message);
    }
}

async function loadTasks() {
    const response = await fetch(`${API}/tasks`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        alert("Unable to load tasks. Please login again.");
        return;
    }

    const data = await response.json();
    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    data.tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";

        const info = document.createElement("div");
        const heading = document.createElement("h3");
        heading.textContent = task.title;
        if (task.completed) heading.classList.add("completed");

        const description = document.createElement("p");
        description.textContent = task.description || "";

        info.append(heading, description);

        const actions = document.createElement("div");

        const updateButton = document.createElement("button");
        updateButton.textContent = task.completed ? "Undo" : "Complete";
        updateButton.onclick = () => updateTask(task);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteTask(task._id);

        actions.append(updateButton, deleteButton);
        card.append(info, actions);
        taskList.appendChild(card);
    });
}

async function updateTask(task) {
    const response = await fetch(`${API}/tasks/${task._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title: task.title,
            description: task.description,
            completed: !task.completed
        })
    });

    if (response.ok) loadTasks();
    else alert("Task update failed");
}

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const response = await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) loadTasks();
    else alert("Task deletion failed");
}

if (token) {
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    loadTasks();
}