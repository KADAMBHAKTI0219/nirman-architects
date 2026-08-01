import React from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';

import EmployeeDashboard from '../components/employee/dashboard/index';
import EmployeeAttendance from '../components/employee/attendance/index';
import EmployeeTasks from '../components/employee/tasks/index';
import EmployeeDrawings from '../components/employee/drawings/index';
import EmployeeDocs from '../components/employee/documents/index';
import EmployeeChat from '../components/employee/chat/index';
import EmployeeNotifications from '../components/employee/notifications/index';
import LeavesPortal from '../components/common/LeavesPortal';
import AppUsageTracking from '../components/admin/app-usage/AppUsageTracking';

export default function getEmployeeRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/employee/app-usage" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="My App Usage Tracking">
          <AppUsageTracking userRole="Employee" />
        </DashboardLayout>
      } />
      <Route path="/employee" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Employee Dashboard">
          <EmployeeDashboard />
        </DashboardLayout>
      } />
      <Route path="/employee/attendance" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Attendance">
          <EmployeeAttendance />
        </DashboardLayout>
      } />
      <Route path="/employee/leaves" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Leaves Portal">
          <LeavesPortal />
        </DashboardLayout>
      } />
      <Route path="/employee/tasks" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="My Tasks">
          <EmployeeTasks />
        </DashboardLayout>
      } />
      <Route path="/employee/drawings" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Drawings Assigned">
          <EmployeeDrawings />
        </DashboardLayout>
      } />
      <Route path="/employee/docs" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Documents">
          <EmployeeDocs />
        </DashboardLayout>
      } />
      <Route path="/employee/chat" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Project Chat">
          <EmployeeChat />
        </DashboardLayout>
      } />
      <Route path="/employee/notifications" element={
        <DashboardLayout role="Employee" onChangeRole={handleRoleChange} title="Notifications">
          <EmployeeNotifications />
        </DashboardLayout>
      } />
    </>
  );
}
