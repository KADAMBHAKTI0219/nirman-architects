import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import BrandLoader from '../components/common/BrandLoader';

const PMDashboard = lazy(() => import('../components/project-manager/dashboard/index'));
const PMProjects = lazy(() => import('../components/project-manager/projects/index'));
const PMTasks = lazy(() => import('../components/project-manager/tasks/index'));
const PMDrawings = lazy(() => import('../components/project-manager/drawings/index'));
const PMTeam = lazy(() => import('../components/project-manager/team/index'));
const PMCommunication = lazy(() => import('../components/project-manager/client-communication/index'));
const PMReports = lazy(() => import('../components/project-manager/reports/index'));
const EmployeeAttendance = lazy(() => import('../components/employee/attendance/index'));
const LeavesPortal = lazy(() => import('../components/common/LeavesPortal'));
const AppUsageTracking = lazy(() => import('../components/admin/app-usage/AppUsageTracking'));

const LazyWrap = ({ children }) => (
  <Suspense fallback={<BrandLoader message="Loading PM Workspace..." />}>
    {children}
  </Suspense>
);

export default function getPmRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/project-manager" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Project Manager">
          <LazyWrap><PMDashboard /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/leaves" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Leaves Portal">
          <LazyWrap><LeavesPortal role="ProjectManager" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/attendance" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><EmployeeAttendance /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/projects" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Projects">
          <LazyWrap><PMProjects /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/tasks" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Tasks">
          <LazyWrap><PMTasks /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/tasks/overdue" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Tasks">
          <LazyWrap><PMTasks /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/drawings" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Drawings">
          <LazyWrap><PMDrawings /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/drawings/approvals" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Drawings">
          <LazyWrap><PMDrawings /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/team" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Team">
          <LazyWrap><PMTeam /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/team/performance" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Team">
          <LazyWrap><PMTeam /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/chats" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Chats">
          <LazyWrap><PMCommunication /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/queries" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Queries">
          <LazyWrap><PMCommunication /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/reports/projects" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Reports">
          <LazyWrap><PMReports /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/reports/tasks" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Reports">
          <LazyWrap><PMReports /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/project-manager/app-usage" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="App Usage Tracking">
          <LazyWrap><AppUsageTracking userRole="ProjectManager" /></LazyWrap>
        </DashboardLayout>
      } />
    </>
  );
}
