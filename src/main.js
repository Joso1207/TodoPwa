import './style.css'

let isOnline = navigator.onLine;
let TodoTasks = [{id: 1, title: "Do things"},
    {id: 2, title: "Do other things"},
    {id: 3, title: "Do other things but differently"}
]

const statusBadge = document.getElementById("status");
const offlineBanner = document.getElementById("offline-banner")
const todoList = document.getElementById("todo-list");
const todoForm = document.getElementById("task-form");
todoForm.addEventListener("submit", async (event)=> {
    event.preventDefault();
    const title = document.getElementById("todo-input");
    const date = document.getElementById("todo-date");
    const task = {title:title.value, dueDate: date.value};
    createTodo(task);
});


todoList.addEventListener("click", (event) => {
    const todoItem = event.target.closest(".todo-item")
    const id = parseInt(todoItem.dataset.id)

    if (event.target.classList.contains("todo-checkbox")) {
        toggleTodo(id)
    }

    if (event.target.classList.contains("todo-delete")) {
        deleteTodo(id);
    }
})

function createTodo (task) {
    if (!isOnline) {
        console.log('Kan inte skapa - offline')
        return
    }
    const newTodo = {
        id: Date.now(),
        title: task.title,
        completed: false,
        description: " ",
        dueDate: task.dueDate
    }
    TodoTasks.push(newTodo)

    console.log(task)
    renderTodos();
}

function deleteTodo(id) {
    if (!isOnline) {
        console.log('Kan inte radera - offline')
        return
    }
    TodoTasks = TodoTasks.filter(t=>t.id !==id)
    console.log("Raderade todo med id:", id)
    renderTodos();
}

function toggleTodo(id) {
    const todo = TodoTasks.find(t => t.id === id)
    if (todo) {
        todo.completed = !todo.completed
        console.log('Toggled:', todo.title, '→', todo.completed)
        renderTodos()
    }
}

function updateConnected() {
    const offlineBanner = document.getElementById("offline-banner");

    if (isOnline) {
        statusBadge.textContent = "Online";
        document.body.className = "online";
        offlineBanner.style.display = "none";
    } else {
        statusBadge.textContent = "Offline";
        document.body.className = "offline";
        offlineBanner.style.display = "block";
    }
}

window.addEventListener("online", () => {
    isOnline = true;
    console.log("Online nu");
    updateConnected();
})

window.addEventListener("offline", () => {
    isOnline= false;
    console.log("Offline nu");
    updateConnected();
})

function renderTodos() {
    todoList.innerHTML = TodoTasks.map(todo => `
    <li class="todo-item" data-id="${todo.id}">
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} />
      <div class="todo-info">
        <span class="todo-title ${todo.completed ? 'completed' : ''}">${todo.title}</span>
        ${todo.dueDate ? `<span class="todo-due-date">${todo.dueDate}</span>` : ''}
      </div>
      <button class="todo-delete">✕</button>
    </li>
  `).join('')
}

renderTodos()
updateConnected()