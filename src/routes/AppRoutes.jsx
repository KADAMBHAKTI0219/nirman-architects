import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ProtectedRoute from './ProtectedRoute';

// Role-based Modular Routes Imports
import getAdminRoutes from './AdminRoutes';
import getHrRoutes from './HrRoutes';
import getPmRoutes from './PmRoutes';
import getArchitectRoutes from './ArchitectRoutes';
import getSiteEngineerRoutes from './SiteEngineerRoutes';
import getEmployeeRoutes from './EmployeeRoutes';
import getCustomerRoutes from './CustomerRoutes';

// Site Engineer explicit routes from PRD
import SiteAttendance from '../components/site-engineer/attendance/index';
import DashboardLayout from '../components/layouts/DashboardLayout';

export default function AppRoutes({ role, setRole, isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Centralized Route Guard Middleware: Prevents unauthorized roles from accessing sub-modules
  if (isAuthenticated) {
    const path = location.pathname;
    if (path.startsWith('/admin') && role !== 'Admin') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (path.startsWith('/hr') && role !== 'HR') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (path.startsWith('/project-manager') && role !== 'ProjectManager') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (path.startsWith('/architect') && role !== 'Architect') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (path.startsWith('/site-engineer') && role !== 'SiteEngineer') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (path.startsWith('/employee') && role !== 'Employee') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (path.startsWith('/customer') && role !== 'Customer') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (path.startsWith('/register') && role !== 'Admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
    
    // Redirect to the appropriate dashboard path
    if (selectedRole === 'Admin') navigate('/admin');
    else if (selectedRole === 'HR') navigate('/hr');
    else if (selectedRole === 'ProjectManager') navigate('/project-manager');
    else if (selectedRole === 'Architect') navigate('/architect');
    else if (selectedRole === 'SiteEngineer') navigate('/site-engineer');
    else if (selectedRole === 'Employee') navigate('/employee');
    else if (selectedRole === 'Customer') navigate('/customer');
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'Admin') navigate('/admin');
    else if (newRole === 'HR') navigate('/hr');
    else if (newRole === 'ProjectManager') navigate('/project-manager');
    else if (newRole === 'Architect') navigate('/architect');
    else if (newRole === 'SiteEngineer') navigate('/site-engineer');
    else if (newRole === 'Employee') navigate('/employee');
    else if (newRole === 'Customer') navigate('/customer');
  };

  return (
    <Routes>
      {/* Public Login Selection page */}
      <Route path="/" element={
        !isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Navigate to={`/${role === 'ProjectManager' ? 'project-manager' : (role === 'SiteEngineer' ? 'site-engineer' : role.toLowerCase())}`} />
        )
      } />

      {/* Register form page - Only Super Admin (Admin) can access */}
      <Route path="/register" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={['Admin']}>
          <Register />
        </ProtectedRoute>
      } />

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-805 p-6">
          <h1 className="text-3xl font-black text-rose-600">Access Denied</h1>
          <p className="text-sm font-semibold mt-2 text-slate-500">Your role does not have authorization to view this resource.</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-6 px-4 py-2 bg-brand-primary text-slate-905 font-bold rounded-xl shadow-3xs hover:scale-102 transition-transform"
          >
            Back to Dashboard
          </button>
        </div>
      } />

      {/* Admin Module Routes */}
      {isAuthenticated && role === 'Admin' && getAdminRoutes(handleRoleChange)}

      {/* HR Module Routes */}
      {isAuthenticated && role === 'HR' && getHrRoutes(handleRoleChange)}

      {/* Project Manager Module Routes */}
      {isAuthenticated && role === 'ProjectManager' && getPmRoutes(handleRoleChange)}

      {/* Architect Module Routes */}
      {isAuthenticated && role === 'Architect' && getArchitectRoutes(handleRoleChange)}

      {/* Site Engineer Module Routes */}
      {isAuthenticated && role === 'SiteEngineer' && getSiteEngineerRoutes(handleRoleChange)}

      {/* PRD Specified Site checkin/checkout/history routes */}
      <Route path="/site/checkin" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={['SiteEngineer']}>
          <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Site Check-in">
            <SiteAttendance defaultTab="checkin" />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/site/checkout" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={['SiteEngineer']}>
          <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Site Check-out">
            <SiteAttendance defaultTab="checkout" />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/site/history" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={['SiteEngineer']}>
          <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Attendance History">
            <SiteAttendance defaultTab="history" />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Employee Module Routes */}
      {isAuthenticated && role === 'Employee' && getEmployeeRoutes(handleRoleChange)}

      {/* Customer Module Routes */}
      {isAuthenticated && role === 'Customer' && getCustomerRoutes(handleRoleChange)}

      {/* Fallback to login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
