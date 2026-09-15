import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useRecoilState, useRecoilValue } from "recoil";

import {
  filteredTodosState,
  searchQueryState,
  todoFilterState,
  todosState,
} from "../store/todo";

export default function TodosPage() {
  const navigate = useNavigate();

  const [todos, setTodos] = useRecoilState(todosState);

  const filteredTodos = useRecoilValue(filteredTodosState);

  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);

  const [filter, setFilter] = useRecoilState(todoFilterState);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadTodos() {
      setIsLoading(true);
      setError(null);

      const result = await window.todoAPI.getAll();

      if (!result.success) {
        setError(result.error.message);

        setIsLoading(false);
        return;
      }

      setTodos(result.data);
      setIsLoading(false);
    }

    loadTodos();
  }, [setTodos]);

  function addTodoToState(todo: (typeof todos)[number]) {
    setTodos((current) => [...current, todo]);
  }

  async function handleCreate() {
    setIsSaving(true);
    setError(null);

    const result = await window.todoAPI.create({
      title: `Todo ${todos.length + 1}`,
    });

    if (!result.success) {
      setError(result.error.message);

      setIsSaving(false);
      return;
    }

    addTodoToState(result.data);

    setIsSaving(false);

    navigate(`/todos/${result.data.id}`);
  }

  async function handleToggle(id: string) {
    setIsSaving(true);
    setError(null);

    const result = await window.todoAPI.getById(id);

    if (!result.success) {
      setError(result.error.message);

      setIsSaving(false);
      return;
    }

    if (!result.data) {
      setError("Todo not found");
      setIsSaving(false);
      return;
    }

    const updateResult = await window.todoAPI.update({
      id: result.data.id,
      title: result.data.title,
      completed: !result.data.completed,
    });

    if (!updateResult.success) {
      setError(updateResult.error.message);

      setIsSaving(false);
      return;
    }

    setTodos((current) =>
      current.map((todo) =>
        todo.id === updateResult.data.id ? updateResult.data : todo,
      ),
    );

    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    setIsSaving(true);
    setError(null);

    const result = await window.todoAPI.delete(id);

    if (!result.success) {
      setError(result.error.message);

      setIsSaving(false);
      return;
    }

    setTodos((current) => current.filter((todo) => todo.id !== id));

    setIsSaving(false);
  }

  return (
    <div>
      <h1>Todos</h1>

      <div>
        <button onClick={handleCreate} disabled={isLoading || isSaving}>
          {isSaving ? "Saving..." : "Create Todo"}
        </button>
      </div>

      <div>
        <input
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          placeholder="Search todos..."
          disabled={isLoading}
        />

        <select
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value as "all" | "active" | "completed");
          }}
          disabled={isLoading}
        >
          <option value="all">All</option>

          <option value="active">Active</option>

          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <p>Error: {error}</p>}

      {isLoading && <p>Loading todos...</p>}

      {!isLoading && filteredTodos.length === 0 && <p>No todos found.</p>}

      {!isLoading && filteredTodos.length > 0 && (
        <ul>
          {filteredTodos.map((todo) => (
            <li key={todo.id}>
              <Link to={`/todos/${todo.id}`}>{todo.title}</Link>{" "}
              <span>{todo.completed ? "✅" : "⬜"}</span>{" "}
              <button onClick={() => handleToggle(todo.id)} disabled={isSaving}>
                Toggle
              </button>{" "}
              <button onClick={() => handleDelete(todo.id)} disabled={isSaving}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
