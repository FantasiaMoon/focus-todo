const STORAGE_KEY = "focus-todo-items";

const form = document.querySelector("#todoForm");
const input = document.querySelector("#todoInput");
const list = document.querySelector("#todoList");
const template = document.querySelector("#todoTemplate");
const emptyState = document.querySelector("#emptyState");
const doneCount = document.querySelector("#doneCount");
const clearDone = document.querySelector("#clearDone");
const filterButtons = document.querySelectorAll(".filter");

let todos = loadTodos();
let currentFilter = "all";

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: Date.now(),
  });

  input.value = "";
  saveAndRender();
});

list.addEventListener("change", (event) => {
  if (!event.target.matches(".toggle")) {
    return;
  }

  const item = event.target.closest(".todo-item");
  const todo = todos.find((entry) => entry.id === item.dataset.id);

  if (todo) {
    todo.done = event.target.checked;
    saveAndRender();
  }
});

list.addEventListener("click", (event) => {
  const item = event.target.closest(".todo-item");

  if (!item) {
    return;
  }

  if (event.target.matches(".task-text")) {
    startEditing(item);
    return;
  }

  if (event.target.matches(".delete-button")) {
    todos = todos.filter((todo) => todo.id !== item.dataset.id);
    saveAndRender();
  }
});

list.addEventListener("focusin", (event) => {
  if (event.target.matches(".task-text")) {
    startEditing(event.target.closest(".todo-item"));
  }
});

list.addEventListener("focusout", (event) => {
  if (event.target.matches(".edit-input")) {
    saveEdit(event.target.closest(".todo-item"));
  }
});

list.addEventListener("keydown", (event) => {
  if (!event.target.matches(".edit-input")) {
    return;
  }

  const item = event.target.closest(".todo-item");

  if (event.key === "Enter") {
    event.preventDefault();
    event.target.blur();
  }

  if (event.key === "Escape") {
    event.preventDefault();
    render();
  }
});

clearDone.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.done);
  saveAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

function render() {
  list.replaceChildren();

  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === "active") {
      return !todo.done;
    }

    if (currentFilter === "done") {
      return todo.done;
    }

    return true;
  });

  visibleTodos.forEach((todo) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const checkbox = node.querySelector(".toggle");
    const text = node.querySelector(".task-text");
    const editInput = node.querySelector(".edit-input");

    node.dataset.id = todo.id;
    node.classList.toggle("is-done", todo.done);
    checkbox.checked = todo.done;
    text.textContent = todo.text;
    editInput.value = todo.text;
    list.append(node);
  });

  const completed = todos.filter((todo) => todo.done).length;
  doneCount.textContent = completed.toString();
  emptyState.classList.toggle("is-visible", visibleTodos.length === 0);
  clearDone.disabled = completed === 0;
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function startEditing(item) {
  const editInput = item.querySelector(".edit-input");

  item.classList.add("is-editing");
  editInput.focus();
  editInput.select();
}

function saveEdit(item) {
  const editInput = item.querySelector(".edit-input");
  const updatedText = editInput.value.trim();
  const todo = todos.find((entry) => entry.id === item.dataset.id);

  if (!todo) {
    return;
  }

  if (!updatedText) {
    render();
    return;
  }

  todo.text = updatedText;
  saveAndRender();
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}
