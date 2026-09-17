import type { MouseEvent } from "react";

import type { Todo } from "../../shared/types/todo";

interface TodoItemProps {
  todo: Todo;

  onToggle: (todo: Todo) => void;

  onDelete: (id: string) => void;

  onOpenDetail: (id: string) => void;
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onOpenDetail,
}: TodoItemProps) {
  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    void window.todoAPI.showTodoContextMenu({
      todoId: todo.id,
      completed: todo.completed,
    });
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
        padding: 10,
        border: "1px solid #ddd",
        borderRadius: 6,
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
      />

      <span
        onClick={() => onOpenDetail(todo.id)}
        style={{
          cursor: "pointer",
          flex: 1,
          textDecoration: todo.completed ? "line-through" : "none",
        }}
      >
        {todo.title}
      </span>

      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
}
