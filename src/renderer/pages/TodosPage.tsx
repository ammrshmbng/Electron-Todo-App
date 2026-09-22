import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";

import { useRecoilState, useRecoilValue } from "recoil";

import {
  filteredTodosState,
  searchQueryState,
  selectedTodoIdState,
  todosState,
} from "../store/todo";

import TodoItem from "../components/TodoItem";

import type { Todo } from "../../shared/types/todo";
import type { TodoContextMenuEvent } from "../../shared/contracts/todo-api";

export default function TodosPage() {
  const [_todos, setTodos] = useRecoilState(todosState);

  const [selectedTodoId, setSelectedTodoId] =
    useRecoilState(selectedTodoIdState);

  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);

  const filteredTodos = useRecoilValue(filteredTodosState);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [isImportingFile, setIsImportingFile] = useState(false);

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
          setSelectedTodoId(event.todoId);

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

          if (event.action === "copy-title") {
            const copied = await window.todoAPI.copyText(todo.title);

            if (!copied) {
              setError("Failed to copy todo title");

              return;
            }

            await window.todoAPI.notify({
              title: "Todo Copied",
              body: "Todo title copied to clipboard.",
            });

            return;
          }

          if (event.action === "copy-json") {
            const copied = await window.todoAPI.copyText(
              JSON.stringify(todo, null, 2),
            );

            if (!copied) {
              setError("Failed to copy todo as JSON");

              return;
            }

            await window.todoAPI.notify({
              title: "Todo Copied",
              body: "Todo JSON copied to clipboard.",
            });

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

  useEffect(() => {
    const unsubscribe = window.todoAPI.onAppCommand((command) => {
      if (command === "new-todo") {
        setError(null);
        setNewTitle("");
        setIsCreateOpen(true);

        return;
      }

      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!isCreateOpen) {
          return;
        }

        setIsCreateOpen(false);
        setNewTitle("");

        return;
      }

      if (event.key !== "Delete") {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (!selectedTodoId) {
        return;
      }

      event.preventDefault();

      void handleDelete(selectedTodoId);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCreateOpen, selectedTodoId]);

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
    setSelectedTodoId(todo.id);

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

      return;
    }

    if (selectedTodoId === id) {
      setSelectedTodoId(null);
    }
  };

  const handleOpenDetail = async (id: string) => {
    setSelectedTodoId(id);

    await window.todoAPI.openTodoDetail(id);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";

    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);

    const file = event.dataTransfer.files[0];

    if (!file) {
      return;
    }

    setError(null);
    setIsImportingFile(true);

    const result = await window.todoAPI.importDroppedFile(file);

    setIsImportingFile(false);

    if (!result.success) {
      setError(result.error.message);

      return;
    }

    await window.todoAPI.notify({
      title: "Todos Imported",
      body: `${result.data.count} todos imported successfully.`,
    });
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
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <h1>Todos</h1>

        <button onClick={() => setIsCreateOpen(true)}>Create Todo</button>
      </div>

      <div
        style={{
          marginBottom: 20,
        }}
      >
        <input
          ref={searchInputRef}
          type="search"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{
            width: "100%",
            maxWidth: 500,
            padding: 8,
          }}
        />
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(event) => void handleDrop(event)}
        style={{
          marginBottom: 20,
          padding: 24,
          border: isDraggingFile ? "2px solid #2563eb" : "2px dashed #aaa",
          borderRadius: 8,
          background: isDraggingFile ? "#eff6ff" : "transparent",
          textAlign: "center",
          transition: "all 0.15s ease",
        }}
      >
        {isImportingFile
          ? "Importing Todo file..."
          : isDraggingFile
            ? "Drop JSON file here"
            : "Drag & drop a Todo JSON file here to import"}
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
                  setNewTitle("");
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
          selected={selectedTodoId === todo.id}
          onSelect={setSelectedTodoId}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onOpenDetail={handleOpenDetail}
        />
      ))}
    </div>
  );
}
