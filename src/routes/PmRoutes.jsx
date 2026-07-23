import React from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';

import PMDashboard from '../components/project-manager/dashboard/index';
import PMProjects from '../components/project-manager/projects/index';
import PMTasks from '../components/project-manager/tasks/index';
import PMDrawings from '../components/project-manager/drawings/index';
import PMTeam from '../components/project-manager/team/index';
import PMCommunication from '../components/project-manager/client-communication/index';
import PMReports from '../components/project-manager/reports/index';

export default function getPmRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/project-manager" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Project Manager">
          <PMDashboard />
        </DashboardLayout>
      } />
      <Route path="/project-manager/projects" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Projects">
          <PMProjects />
        </DashboardLayout>
      } />
      <Route path="/project-manager/tasks" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Tasks">
          <PMTasks />
        </DashboardLayout>
      } />
      <Route path="/project-manager/tasks/overdue" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Tasks">
          <PMTasks />
        </DashboardLayout>
      } />
      <Route path="/project-manager/drawings" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Drawings">
          <PMDrawings />
        </DashboardLayout>
      } />
      <Route path="/project-manager/drawings/approvals" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Drawings">
          <PMDrawings />
        </DashboardLayout>
      } />
      <Route path="/project-manager/team" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Team">
          <PMTeam />
        </DashboardLayout>
      } />
      <Route path="/project-manager/team/performance" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Team">
          <PMTeam />
        </DashboardLayout>
      } />
      <Route path="/project-manager/chats" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Chats">
          <PMCommunication />
        </DashboardLayout>
      } />
      <Route path="/project-manager/queries" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Queries">
          <PMCommunication />
        </DashboardLayout>
      } />
      <Route path="/project-manager/reports/projects" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Reports">
          <PMReports />
        </DashboardLayout>
      } />
      <Route path="/project-manager/reports/tasks" element={
        <DashboardLayout role="ProjectManager" onChangeRole={handleRoleChange} title="Reports">
          <PMReports />
        </DashboardLayout>
      } />
    </>
  );
}
