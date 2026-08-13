import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import BrandLoader from '../components/common/BrandLoader';

const ArchitectDashboard = lazy(() => import('../components/architect/dashboard/index'));
const ArchitectTasks = lazy(() => import('../components/architect/tasks/index'));
const ArchitectDrawings = lazy(() => import('../components/architect/drawings/index'));
const ArchitectTime = lazy(() => import('../components/architect/time-tracking/index'));
const ArchitectChats = lazy(() => import('../components/architect/chats/index'));
const ArchitectDocs = lazy(() => import('../components/architect/documents/index'));
const ArchitectNotifications = lazy(() => import('../components/architect/notifications/index'));
const LeavesPortal = lazy(() => import('../components/common/LeavesPortal'));
const EmployeeAttendance = lazy(() => import('../components/employee/attendance/index'));
const AppUsageTracking = lazy(() => import('../components/admin/app-usage/AppUsageTracking'));
const ArchitectProjects = lazy(() => import('../components/admin/projects/index'));

const LazyWrap = ({ children }) => (
  <Suspense fallback={<BrandLoader message="Loading Design Studio..." />}>
    {children}
  </Suspense>
);

export default function getArchitectRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/architect" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Architect / Designer">
          <LazyWrap><ArchitectDashboard /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/projects" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="My Projects">
          <LazyWrap><ArchitectProjects /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/leaves" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Leaves Portal">
          <LazyWrap><LeavesPortal /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/attendance" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><EmployeeAttendance /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/tasks" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="My Tasks">
          <LazyWrap><ArchitectTasks /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/drawings" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="My Drawings">
          <LazyWrap><ArchitectDrawings /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/time" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Time Tracking">
          <LazyWrap><ArchitectTime /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/chats" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Project Chats">
          <LazyWrap><ArchitectChats /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/docs" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Documents">
          <LazyWrap><ArchitectDocs /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/notifications" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Notifications">
          <LazyWrap><ArchitectNotifications /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/architect/app-usage" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="App Usage Tracking">
          <LazyWrap><AppUsageTracking userRole="Architect" /></LazyWrap>
        </DashboardLayout>
      } />
    </>
  );
}
