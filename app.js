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
  if (!event.target.matches(".delete-button")) {
    return;
  }

  const item = event.target.closest(".todo-item");
  todos = todos.filter((todo) => todo.id !== item.dataset.id);
  saveAndRender();
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

    node.dataset.id = todo.id;
    node.classList.toggle("is-done", todo.done);
    checkbox.checked = todo.done;
    text.textContent = todo.text;
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

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}
