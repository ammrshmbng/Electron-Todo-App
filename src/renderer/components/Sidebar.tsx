import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <p>hello world Sidebar</p>
      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/todos">Todos</NavLink>
        <NavLink to="/todos/1">Todo Detail</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
    </aside>
  );
}
