import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
  const [role, setRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return 'Admin';
      
      const parsedUser = JSON.parse(savedUser);
      const rawRole = parsedUser.roleCode || parsedUser.role || 'Employee';
      
      // Normalize role to match React router definitions
      const r = rawRole.toLowerCase().trim();
      if (r.includes('admin') || r.includes('super_admin') || r.includes('super admin')) return 'Admin';
      if (r === 'hr') return 'HR';
      if (r.includes('site') || r.includes('engineer') || r === 'site_engineer') return 'SiteEngineer';
      if (r.includes('manager') || r === 'project_manager') return 'ProjectManager';
      if (r.includes('architect')) return 'Architect';
      if (r.includes('customer')) return 'Customer';
      return 'Employee';
    } catch {
      return 'Admin';
    }
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes 
          role={role} 
          setRole={setRole} 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
        />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
