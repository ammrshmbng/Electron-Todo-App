import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function TodoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock data - nanti bisa diganti dengan real data
  const todo = {
    id: Number(id),
    title: 'Sample Todo',
    description: 'Ini adalah deskripsi detail dari todo item',
    completed: false,
    createdAt: new Date().toLocaleDateString('id-ID'),
  };

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Kembali
      </button>
      
      <h1>Todo Detail #{id}</h1>
      
      <div className="detail-card">
        <h2>{todo.title}</h2>
        <p className="description">{todo.description}</p>
        
        <div className="meta-info">
          <p><strong>Status:</strong> {todo.completed ? 'Completed ✅' : 'Pending ⏳'}</p>
          <p><strong>Dibuat:</strong> {todo.createdAt}</p>
        </div>
      </div>
    </div>
  );
}
