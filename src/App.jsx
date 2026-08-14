import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './context/ToastContext';
import CustomDialogProvider from './components/common/CustomDialogProvider';
import './App.css';

function App() {
  const [role, setRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!savedUser) return null;
      
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.isClientPortal) return 'Customer';

      const rawRole = parsedUser.roleCode || parsedUser.role;
      if (!rawRole) return null;

      const r = String(rawRole).toLowerCase().replace(/[\s_\-]/g, '').trim();

      // Strict role mapping switch case - returns null if not an allowed role
      switch (r) {
        case 'superadmin':
        case 'admin':
          return 'Admin';
        case 'hr':
          return 'HR';
        case 'projectmanager':
        case 'pm':
          return 'ProjectManager';
        case 'architect':
          return 'Architect';
        case 'siteengineer':
        case 'sitemanager':
          return 'SiteEngineer';
        case 'employee':
          return 'Employee';
        case 'client':
          case 'customer':
          return 'Customer';
        default:
          return null;
      }
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hasToken = !!(localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken'));
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!hasToken || !savedUser) return false;

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.isClientPortal) return true;

      const rawRole = parsedUser.roleCode || parsedUser.role;
      if (!rawRole) return false;

      const r = String(rawRole).toLowerCase().replace(/[\s_\-]/g, '').trim();
      const validRoles = ['superadmin', 'admin', 'hr', 'projectmanager', 'pm', 'architect', 'siteengineer', 'sitemanager', 'employee', 'client', 'customer'];
      return validRoles.includes(r);
    } catch {
      return false;
    }
  });

  return (
    <ToastProvider>
      <CustomDialogProvider>
        <BrowserRouter>
          <AppRoutes 
            role={role} 
            setRole={setRole} 
            isAuthenticated={isAuthenticated} 
            setIsAuthenticated={setIsAuthenticated} 
          />
        </BrowserRouter>
      </CustomDialogProvider>
    </ToastProvider>
  );
}

export default App;
