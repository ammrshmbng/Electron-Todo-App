import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, title: 'Belajar Electron', completed: false },
    { id: 2, title: 'Bikin Todo App', completed: true },
    { id: 3, title: 'Deploy ke production', completed: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="page-container">
      <h1>Todos</h1>
      
      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className="todo-item">
            <input 
              type="checkbox" 
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.title}
            </span>
            <Link to={`/todos/${todo.id}`} className="view-detail-btn">
              Detail
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
