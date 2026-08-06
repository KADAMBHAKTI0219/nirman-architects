import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import BrandLoader from '../components/common/BrandLoader';

const EmployeeDashboard = lazy(() => import('../components/employee/dashboard/index'));
const EmployeeAttendance = lazy(() => import('../components/employee/attendance/index'));
const EmployeeTasks = lazy(() => import('../components/employee/tasks/index'));
const EmployeeDrawings = lazy(() => import('../components/employee/drawings/index'));
const EmployeeDocs = lazy(() => import('../components/employee/documents/index'));
const EmployeeChat = lazy(() => import('../components/employee/chat/index'));
const EmployeeNotifications = lazy(() => import('../components/employee/notifications/index'));
const LeavesPortal = lazy(() => import('../components/common/LeavesPortal'));
const AppUsageTracking = lazy(() => import('../components/admin/app-usage/AppUsageTracking'));

const LazyWrap = ({ children }) => (
  <Suspense fallback={<BrandLoader message="Loading Employee Workspace..." />}>
    {children}
  </Suspense>
);

export default function getEmployeeRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/employee/app-usage" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="My App Usage Tracking">
          <LazyWrap><AppUsageTracking userRole="Employee" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/employee" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Employee Dashboard">
          <LazyWrap><EmployeeDashboard /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/employee/attendance" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><EmployeeAttendance /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/employee/leaves" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Leaves Portal">
          <LazyWrap><LeavesPortal /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/employee/tasks" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="My Tasks">
          <LazyWrap><EmployeeTasks /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/employee/drawings" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Drawings Assigned">
          <LazyWrap><EmployeeDrawings /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/employee/docs" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Documents">
          <LazyWrap><EmployeeDocs /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/employee/chat" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Project Chat">
          <LazyWrap><EmployeeChat /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/employee/notifications" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Notifications">
          <LazyWrap><EmployeeNotifications /></LazyWrap>
        </DashboardLayout>
      } />
    </>
  );
}
