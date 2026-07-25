import React from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';

import ArchitectDashboard from '../components/architect/dashboard/index';
import ArchitectTasks from '../components/architect/tasks/index';
import ArchitectDrawings from '../components/architect/drawings/index';
import ArchitectTime from '../components/architect/time-tracking/index';
import ArchitectChats from '../components/architect/chats/index';
import ArchitectDocs from '../components/architect/documents/index';
import ArchitectNotifications from '../components/architect/notifications/index';
import LeavesPortal from '../components/common/LeavesPortal';

export default function getArchitectRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/architect" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Architect / Designer">
          <ArchitectDashboard />
        </DashboardLayout>
      } />
      <Route path="/architect/leaves" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Leaves Portal">
          <LeavesPortal />
        </DashboardLayout>
      } />
      <Route path="/architect/tasks" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="My Tasks">
          <ArchitectTasks />
        </DashboardLayout>
      } />
      <Route path="/architect/drawings" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="My Drawings">
          <ArchitectDrawings />
        </DashboardLayout>
      } />
      <Route path="/architect/time" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Time Tracking">
          <ArchitectTime />
        </DashboardLayout>
      } />
      <Route path="/architect/chats" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Project Chats">
          <ArchitectChats />
        </DashboardLayout>
      } />
      <Route path="/architect/docs" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Documents">
          <ArchitectDocs />
        </DashboardLayout>
      } />
      <Route path="/architect/notifications" element={
        <DashboardLayout role="Architect" onChangeRole={handleRoleChange} title="Notifications">
          <ArchitectNotifications />
        </DashboardLayout>
      } />
    </>
  );
}
