import React from 'react';

export default function Dashboard() {
  return (
    <div className="page-container">
      <h1>Dashboard</h1>
      <p>Selamat datang di dashboard aplikasi!</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Todos</h3>
          <p className="stat-number">24</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">12</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">12</p>
        </div>
      </div>
    </div>
  );
}
