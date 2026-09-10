import React, { useState } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  return (
    <div className="page-container">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <label>Theme</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Preferences</h3>
        
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            Enable Notifications
          </label>
        </div>

        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            Auto Save
          </label>
        </div>
      </div>

      <button className="save-btn">Simpan Perubahan</button>
    </div>
  );
}
