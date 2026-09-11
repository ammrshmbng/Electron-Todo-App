import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <p>hello world App</p>
        <Outlet />
      </main>
    </div>
  );
}
