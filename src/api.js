const API_URL = "http://192.168.0.28:3001/todos";


export async function getTodos() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    ;
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    localStorage.setItem("todo-cache",JSON.stringify(data));
    return data;

  } catch (error) {
    const cached = JSON.parse(localStorage.getItem("todo-cache")) || [];
    console.error("Failed to fetch todos:", error);

    return cached;
  }
}

export async function getTodo(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const todo = await response.json();
    return todo;

  } catch (error) {
      console.error("Failed to fetch todos:", error);
      console.error("Fallback to Cached data");
      const cached = JSON.parse(localStorage.getItem("todo-cache")) || [];
      const todo = cached.find(t => t.id === id);
      if (todo) {
        return todo;
      } else {
        throw new Error("Todo not found in cache");
    }
  }
}


const POST_QUEUE_KEY = "post-queue";

function getPostQueue() {
  return JSON.parse(localStorage.getItem(POST_QUEUE_KEY)) || [];
}

function savePostQueue(queue) {
  localStorage.setItem(POST_QUEUE_KEY, JSON.stringify(queue));
}

export async function addTodo(todo) {
  
  try{
    const response = await fetch(`${API_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(todo)
  });
  
  if (!response.ok) {
    throw new Error('Failed to add todo');
  }

  return response.json();
  }
  catch(error){
    // Save a structured queue entry so flushPostQueue can retry reliably.
    const queue = getPostQueue();
    queue.push({ url: API_URL, payload: todo });
    savePostQueue(queue);
    // Return the queued item so callers can update UI if needed.
    return todo;
  }
}

export async function flushPostQueue() {
  const queue = getPostQueue();
  if (!queue.length) return;

  const remaining = [];

  for (const item of queue) {
    try {
      // Support both structured queue entries ({url,payload}) and legacy raw todo objects
      const url = item.url || API_URL;
      const payload = item.payload || item;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Retry failed");
      }
    } catch {
      remaining.push(item); // keep it for next retry
    }
  }

  savePostQueue(remaining);
}

export async function updateTodo(todo) {
  const response = await fetch(`${API_URL}/${todo.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(todo)
  });

  if (!response.ok) {
    throw new Error('Failed to update todo');
  }

  return response.json();
}

export async function removeTodo(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
}

export function createTodoElement(todo) {
  const li = document.createElement("li");
  
  li.className = "todo-list" 
  li.setAttribute(data-id ,todo.id)

  li.innerHTML = `
    <input type="checkbox" class="todo-checkbox" $todo.completed ? 'checked' : ''>
    <div class="todo-info">
        <span class="todo-title" ${todo.completed ? 'completed' : ''}">${todo.title}</span>
        ${todo.dueDate ? `<span class="todo-due-date">${todo.dueDate}</span>` : ''}
    </div>
    <button class="todo-delete">✕</button>
  `;
  return li;
}
