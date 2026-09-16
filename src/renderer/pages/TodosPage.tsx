import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";

import { todosState, filteredTodosState } from "../store/todo";

export default function TodosPage() {
  const navigate = useNavigate();

  const [todos, setTodos] = useRecoilState(todosState);
  const filteredTodos = useRecoilValue(filteredTodosState);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = async () => {
    setError(null);
    const result = await window.todoAPI.getAll();

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setTodos(result.data);
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      await loadTodos();

      setLoading(false);
    };

    initialize();

    const unsubscribe = window.todoAPI.onChanged(async () => {
      await loadTodos();
    });

    return unsubscribe;
  }, []);

  const handleCreate = async () => {
    

    const result = await window.todoAPI.create({
      title: `Todo : ${todos.length+1}`,
    });

    if (!result.success) {
      setError(result.error.message);
    }
  };

  const handleToggle = async (todo: (typeof todos)[number]) => {
    const result = await window.todoAPI.update({
      id: todo.id,
      title: todo.title,
      completed: !todo.completed,
    });

    if (!result.success) {
      setError(result.error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await window.todoAPI.delete(id);

    if (!result.success) {
      setError(result.error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h1>Todos</h1>

        <button onClick={handleCreate}>Create Todo</button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 20,
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      {filteredTodos.length === 0 && <div>No todos found.</div>}

      {filteredTodos.map((todo) => (
        <div
          key={todo.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo)}
          />

          <span
            onClick={() => navigate(`/todos/${todo.id}`)}
            style={{
              cursor: "pointer",
              textDecoration: todo.completed ? "line-through" : "none",
            }}
          >
            {todo.title}
          </span>

          <button onClick={() => handleDelete(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
