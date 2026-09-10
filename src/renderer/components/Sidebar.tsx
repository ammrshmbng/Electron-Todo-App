import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>⚡ Electron App</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span className="icon">📊</span>
          Dashboard
        </NavLink>

        <NavLink 
          to="/todos" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span className="icon">✅</span>
          Todos
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span className="icon">⚙️</span>
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>v1.0.0</p>
      </div>
    </div>
  );
}
