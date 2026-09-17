import { useEffect, useState } from "react";

import { useRecoilState, useRecoilValue } from "recoil";

import { filteredTodosState, todosState } from "../store/todo";

import TodoItem from "../components/TodoItem";

import type { Todo } from "../../shared/types/todo";
import type { TodoContextMenuEvent } from "../../shared/contracts/todo-api";

export default function TodosPage() {
  const [_todos, setTodos] = useRecoilState(todosState);

  const filteredTodos = useRecoilValue(filteredTodosState);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");

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

    void initialize();

    const unsubscribe = window.todoAPI.onChanged(async () => {
      await loadTodos();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = window.todoAPI.onTodoContextMenuAction(
      (event: TodoContextMenuEvent) => {
        const handleAction = async () => {
          if (event.action === "open-detail") {
            await window.todoAPI.openTodoDetail(event.todoId);

            return;
          }

          const result = await window.todoAPI.getById(event.todoId);

          if (!result.success) {
            setError(result.error.message);

            return;
          }

          const todo = result.data;

          if (!todo) {
            setError("Todo not found");

            return;
          }

          if (event.action === "toggle-completed") {
            const updateResult = await window.todoAPI.update({
              id: todo.id,
              title: todo.title,
              completed: !todo.completed,
            });

            if (!updateResult.success) {
              setError(updateResult.error.message);
            }

            return;
          }

          const confirmed = await window.todoAPI.confirm({
            title: "Delete Todo",
            message: "Are you sure you want to delete this todo?",
            detail: "This action cannot be undone.",
          });

          if (!confirmed) {
            return;
          }

          const deleteResult = await window.todoAPI.delete(todo.id);

          if (!deleteResult.success) {
            setError(deleteResult.error.message);
          }
        };

        void handleAction();
      },
    );

    return unsubscribe;
  }, []);

  const handleCreate = async () => {
    const title = newTitle.trim();

    if (!title) {
      setError("Todo title is required");

      return;
    }

    const result = await window.todoAPI.create({
      title,
    });

    if (!result.success) {
      setError(result.error.message);

      return;
    }

    setNewTitle("");
    setIsCreateOpen(false);
    setError(null);

    await window.todoAPI.notify({
      title: "Todo Created",
      body: `"${result.data.title}" was created successfully.`,
    });
  };

  const handleToggle = async (todo: Todo) => {
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
    const confirmed = await window.todoAPI.confirm({
      title: "Delete Todo",
      message: "Are you sure you want to delete this todo?",
      detail: "This action cannot be undone.",
    });

    if (!confirmed) {
      return;
    }

    const result = await window.todoAPI.delete(id);

    if (!result.success) {
      setError(result.error.message);
    }
  };

  const handleOpenDetail = async (id: string) => {
    await window.todoAPI.openTodoDetail(id);
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

        <button onClick={() => setIsCreateOpen(true)}>Create Todo</button>
      </div>

      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 360,
              padding: 20,
              background: "#fff",
              borderRadius: 8,
            }}
          >
            <h2
              style={{
                marginBottom: 12,
              }}
            >
              New Todo
            </h2>

            <input
              autoFocus
              type="text"
              placeholder="Todo title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleCreate();
                }

                if (event.key === "Escape") {
                  setIsCreateOpen(false);
                }
              }}
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 16,
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewTitle("");
                }}
              >
                Cancel
              </button>

              <button onClick={() => void handleCreate()}>Create</button>
            </div>
          </div>
        </div>
      )}

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
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onOpenDetail={handleOpenDetail}
        />
      ))}
    </div>
  );
}
