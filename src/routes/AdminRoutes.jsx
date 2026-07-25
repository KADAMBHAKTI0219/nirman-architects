import React from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';

import AdminDashboard from '../components/admin/dashboard/index';
import AdminProjects from '../components/admin/projects/index';
import AdminTasks from '../components/admin/tasks/index';
import AdminDrawings from '../components/admin/drawings/index';
import AdminEmployees from '../components/admin/employees/index';
import AdminAttendance from '../components/admin/attendance/index';
import AdminHRPayroll from '../components/admin/hr-payroll/index';
import AdminCRM from '../components/admin/crm/index';
import AdminDocs from '../components/admin/documents/index';
import AdminAnalytics from '../components/admin/analytics/index';
import AdminNotifications from '../components/admin/notifications/index';
import AdminSettings from '../components/admin/settings/index';
import AdminBI from '../components/admin/bi/index';

export default function getAdminRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/admin" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Admin / Super Admin">
          <AdminDashboard />
        </DashboardLayout>
      } />
      <Route path="/admin/projects" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Projects">
          <AdminProjects />
        </DashboardLayout>
      } />
      <Route path="/admin/projects/new" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Projects">
          <AdminProjects />
        </DashboardLayout>
      } />
      <Route path="/admin/projects/timeline" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Projects">
          <AdminProjects />
        </DashboardLayout>
      } />
      <Route path="/admin/tasks" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Tasks">
          <AdminTasks />
        </DashboardLayout>
      } />
      <Route path="/admin/tasks/overdue" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Tasks">
          <AdminTasks />
        </DashboardLayout>
      } />
      <Route path="/admin/drawings" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Drawings">
          <AdminDrawings />
        </DashboardLayout>
      } />
      <Route path="/admin/drawings/approvals" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Drawings">
          <AdminDrawings />
        </DashboardLayout>
      } />
      <Route path="/admin/drawings/gfc" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Drawings">
          <AdminDrawings />
        </DashboardLayout>
      } />
      <Route path="/admin/employees" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Employees">
          <AdminEmployees />
        </DashboardLayout>
      } />
      <Route path="/admin/employees/departments" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Employees">
          <AdminEmployees />
        </DashboardLayout>
      } />
      <Route path="/admin/attendance/office" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Attendance">
          <AdminAttendance />
        </DashboardLayout>
      } />
      <Route path="/admin/attendance/site" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Attendance">
          <AdminAttendance />
        </DashboardLayout>
      } />
      <Route path="/admin/attendance/reports" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Attendance">
          <AdminAttendance />
        </DashboardLayout>
      } />
      <Route path="/admin/hr/leaves" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <AdminHRPayroll />
        </DashboardLayout>
      } />
      <Route path="/admin/hr/shifts" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <AdminHRPayroll />
        </DashboardLayout>
      } />
      <Route path="/admin/hr/payroll" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <AdminHRPayroll />
        </DashboardLayout>
      } />
      <Route path="/admin/hr/reviews" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <AdminHRPayroll />
        </DashboardLayout>
      } />
      <Route path="/admin/crm/clients" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <AdminCRM />
        </DashboardLayout>
      } />
      <Route path="/admin/crm/projects" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <AdminCRM />
        </DashboardLayout>
      } />
      <Route path="/admin/crm/queries" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <AdminCRM />
        </DashboardLayout>
      } />
      <Route path="/admin/docs/projects" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Documents">
          <AdminDocs />
        </DashboardLayout>
      } />
      <Route path="/admin/docs/global" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Documents">
          <AdminDocs />
        </DashboardLayout>
      } />
      <Route path="/admin/reports/projects" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <AdminAnalytics />
        </DashboardLayout>
      } />
      <Route path="/admin/reports/productivity" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <AdminAnalytics />
        </DashboardLayout>
      } />
      <Route path="/admin/reports/drawings" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <AdminAnalytics />
        </DashboardLayout>
      } />
      <Route path="/admin/reports/customers" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <AdminAnalytics />
        </DashboardLayout>
      } />
      <Route path="/admin/notifications" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Notifications">
          <AdminNotifications />
        </DashboardLayout>
      } />
      <Route path="/admin/settings" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Settings">
          <AdminSettings />
        </DashboardLayout>
      } />
      <Route path="/admin/bi" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="BI & Future">
          <AdminBI />
        </DashboardLayout>
      } />
    </>
  );
}
