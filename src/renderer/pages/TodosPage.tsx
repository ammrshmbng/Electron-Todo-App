import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  filteredTodosState,
  searchQueryState,
  todoFilterState,
  todosState,
} from "../store/todo";

export default function TodosPage() {
  const [todos, setTodos] = useRecoilState(todosState);

  const filteredTodos = useRecoilValue(filteredTodosState);

  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);

  const [filter, setFilter] = useRecoilState(todoFilterState);

  useEffect(() => {
  window.todoAPI.getAll().then((todos) => {
    setTodos(todos);
  });
}, [setTodos]);

  async function handleCreate() {
    const todo = await window.todoAPI.create({
      title: `Todo ${todos.length + 1}`,
    });

    setTodos((current) => [...current, todo]);
  }

  async function handleToggle(id: string) {
    const todo = await window.todoAPI.getById(id);

    if (!todo) {
      return;
    }

    const updatedTodo = await window.todoAPI.update({
      id: todo.id,
      title: todo.title,
      completed: !todo.completed,
    });

    setTodos((current) =>
      current.map((item) => (item.id === updatedTodo.id ? updatedTodo : item)),
    );
  }

  async function handleDelete(id: string) {
    await window.todoAPI.delete(id);

    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  return (
    <div>
      <h1>Todos</h1>

      <button onClick={handleCreate}>Create Todo</button>

      <div>
        <input
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          placeholder="Search..."
        />

        <select
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value as "all" | "active" | "completed");
          }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <span>
              {todo.title} {todo.completed ? "✅" : "⬜"}
            </span>

            <button onClick={() => handleToggle(todo.id)}>Toggle</button>

            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
