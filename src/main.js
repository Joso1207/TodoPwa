import './style.css'
import {flushPostQueue, getTodo, getTodos, addTodo,updateTodo,removeTodo } from './api.js';
import {v4 as uuidv4} from 'uuid';



let isOnline = navigator.onLine;

const userInput = document.getElementById("user");
const userButton = document.getElementById("user-button");
const statusBadge = document.getElementById("status");
const offlineBanner = document.getElementById("offline-banner")
const todoList = document.getElementById("todo-list");
const todoForm = document.getElementById("task-form");

userButton.addEventListener("click", () => {
    document.cookie = `username=${userInput.value}; path=/; max-age=86400`;
    alert(`Username set to ${userInput.value}`);
    usercookieset();
});

todoForm.addEventListener("submit", async (event)=> {
    event.preventDefault();
    const title = document.getElementById("todo-input");
    const date = document.getElementById("todo-date");
    const task = {title:title.value, dueDate: date.value};
    createTodo(task);
});


todoList.addEventListener("click", (event) => {
    console.log(event.target)
    const todoItem = event.target.closest(".todo-item")
    const id = todoItem.dataset.id
    console.log(id)
    console.log(todoItem)

    if (event.target.classList.contains("todo-checkbox")) {
        toggleTodo(id)
        console.log(id)
    }

    if (event.target.classList.contains("todo-delete")) {
        deleteTodo(id);
    }
})

async function createTodo (task) {
    if (!isOnline) {
        console.log('Kan inte skapa - offline')
        return
    }
    const newTodo = {
        id: uuidv4(),
        title: task.title,
        completed: false,
        description: " ",
        dueDate: task.dueDate
    }
    await addTodo(newTodo)


    console.log(task)
    renderTodos();
}

function deleteTodo(id) {
    if (!isOnline) {
        console.log('Kan inte radera - offline')
        return
    }
    removeTodo(id).then(() => {
    console.log("Raderade todo med id:", id)
    renderTodos();
    })
}

async function toggleTodo(id) {
    console.log(id)
    const todo = await getTodo(id)
    if (todo) {
        todo.completed = !todo.completed
        console.log('Toggled:', todo.title, '→', todo.completed)
        await updateTodo(todo)
        renderTodos()
    }
}

function updateConnected() {
    const offlineBanner = document.getElementById("offline-banner");
    console.log("AAAA")
    console.log(isOnline)
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

function usercookieset(){
    document.cookie.valueOf("username") ? document.getElementById("current-user").textContent = document.cookie.split("; ").find(row => row.startsWith("username=")).split("=")[1] : document.getElementById("current-user").textContent = "no-user";
}

window.addEventListener("online", () => {
    isOnline = true;
    console.log("Online nu");
    flushPostQueue(); //flushes the offline POST queue to sync with backend0+
    updateConnected();
})

window.addEventListener("offline", () => {
    isOnline= false;
    console.log("Offline nu");
    updateConnected();
})

async function renderTodos() {

    let apiTodos = await getTodos()

    todoList.innerHTML = apiTodos.map(todo => `
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

usercookieset()
renderTodos()
updateConnected()