import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useRecoilState } from "recoil";

import { todosState } from "../store/todo";

export default function TodoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [todos, setTodos] = useRecoilState(todosState);

  const [title, setTitle] = useState("");

  const [completed, setCompleted] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTodo() {
      if (!id) {
        setError("Todo id is required");

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await window.todoAPI.getById(id);

      if (!result.success) {
        setError(result.error.message);

        setIsLoading(false);
        return;
      }

      if (!result.data) {
        setError("Todo not found");

        setIsLoading(false);
        return;
      }

      setTitle(result.data.title);
      setCompleted(result.data.completed);

      setIsLoading(false);
    }

    loadTodo();
  }, [id]);

  async function handleSave() {
    if (!id) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await window.todoAPI.update({
      id,
      title,
      completed,
    });

    if (!result.success) {
      setError(result.error.message);

      setIsSaving(false);
      return;
    }

    setTodos((current) =>
      current.map((todo) => (todo.id === result.data.id ? result.data : todo)),
    );

    setTitle(result.data.title);
    setCompleted(result.data.completed);

    setIsSaving(false);
  }

  async function handleDelete() {
    if (!id) {
      return;
    }

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

    navigate("/todos");
  }

  if (isLoading) {
    return (
      <div>
        <p>Loading todo...</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/todos">← Back to Todos</Link>

      <h1>Todo Detail</h1>

      {error && <p>Error: {error}</p>}

      <div>
        <label>Title</label>

        <br />

        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          disabled={isSaving}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={completed}
            onChange={(event) => {
              setCompleted(event.target.checked);
            }}
            disabled={isSaving}
          />{" "}
          Completed
        </label>
      </div>

      <div>
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>{" "}
        <button onClick={handleDelete} disabled={isSaving}>
          Delete
        </button>
      </div>
    </div>
  );
}
