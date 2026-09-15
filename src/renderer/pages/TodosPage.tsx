import { useEffect, useState } from "react";

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

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadTodos() {
      setIsLoading(true);
      setError(null);

      const result = await window.todoAPI.getAll();

      if (result.success === true) {
        setTodos(result.data);
        setIsLoading(false);
      } else if (result.success === false) {
        setError(result.error.message);
        setIsLoading(false);
      }
    }

    loadTodos();
  }, [setTodos]);

  /* async function handleCreate() {
    setIsSaving(true);
    setError(null);

    const result = await window.todoAPI.create({
      title: `Todo ${todos.length + 1}`,
    });

    if (result.success) {
      setTodos((current) => [...current, result.data]);
    } else {
      setError(result.error.message);
    }

    setIsSaving(false);
  } */

      /* handle error test */
  async function handleCreate() {
    setIsSaving(true);
    setError(null);

    const result = await window.todoAPI.create({
      title: "",
    });

    if (!result.success) {
      setError(result.error.message);
      setIsSaving(false);
      return;
    }

    setTodos((current) => [...current, result.data]);

    setIsSaving(false);
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

    const todo = result.data;

    if (!todo) {
      setError("Todo not found");
      setIsSaving(false);
      return;
    }

    const updateResult = await window.todoAPI.update({
      id: todo.id,
      title: todo.title,
      completed: !todo.completed,
    });

    if (updateResult.success) {
      setTodos((current) =>
        current.map((item) =>
          item.id === updateResult.data.id ? updateResult.data : item,
        ),
      );
    } else {
      setError(updateResult.error.message);
    }

    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    setIsSaving(true);
    setError(null);

    const result = await window.todoAPI.delete(id);

    if (result.success) {
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } else {
      setError(result.error.message);
    }

    setIsSaving(false);
  }

  return (
    <div>
      <h1>Todos</h1>

      <button onClick={handleCreate} disabled={isSaving}>
        {isSaving ? "Saving..." : "Create Todo"}
      </button>

      <div>
        <input
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          placeholder="Search..."
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

      {isLoading && <p>Loading todos...</p>}

      {error && <p>Error: {error}</p>}

      {!isLoading && filteredTodos.length === 0 && <p>No todos</p>}

      {!isLoading && filteredTodos.length > 0 && (
        <ul>
          {filteredTodos.map((todo) => (
            <li key={todo.id}>
              <span>
                {todo.title} {todo.completed ? "✅" : "⬜"}
              </span>

              <button onClick={() => handleToggle(todo.id)} disabled={isSaving}>
                Toggle
              </button>

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
