import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import BrandLoader from '../components/common/BrandLoader';

// Lazy-loaded route components for high performance and minimal initial bundle size
const AdminDashboard = lazy(() => import('../components/admin/dashboard/index'));
const AdminProjects = lazy(() => import('../components/admin/projects/index'));
const AdminTasks = lazy(() => import('../components/admin/tasks/index'));
const AdminDrawings = lazy(() => import('../components/admin/drawings/index'));
const AdminEmployees = lazy(() => import('../components/admin/employees/index'));
const AdminAttendance = lazy(() => import('../components/admin/attendance/index'));
const AdminHRPayroll = lazy(() => import('../components/admin/hr-payroll/index'));
const AdminCRM = lazy(() => import('../components/admin/crm/index'));
const AdminDocs = lazy(() => import('../components/admin/documents/index'));
const AdminAnalytics = lazy(() => import('../components/admin/analytics/index'));
const AdminNotifications = lazy(() => import('../components/admin/notifications/index'));
const AdminSettings = lazy(() => import('../components/admin/settings/index'));
const AdminBI = lazy(() => import('../components/admin/bi/index'));
const AppUsageTracking = lazy(() => import('../components/admin/app-usage/AppUsageTracking'));

const LazyWrap = ({ children }) => (
  <Suspense fallback={<BrandLoader message="Loading Admin Workspace..." />}>
    {children}
  </Suspense>
);

export default function getAdminRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/admin/app-usage" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="App Usage Tracking">
          <LazyWrap><AppUsageTracking userRole="Admin" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Admin / Super Admin">
          <LazyWrap><AdminDashboard /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/projects" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Projects">
          <LazyWrap><AdminProjects defaultTab="directory" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/projects/new" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Projects">
          <LazyWrap><AdminProjects defaultTab="directory" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/projects/timeline" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Projects">
          <LazyWrap><AdminProjects defaultTab="timeline" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/tasks" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Tasks">
          <LazyWrap><AdminTasks filter="all" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/tasks/overdue" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Tasks">
          <LazyWrap><AdminTasks filter="overdue" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/drawings" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Drawings">
          <LazyWrap><AdminDrawings defaultTab="all" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/drawings/approvals" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Drawings">
          <LazyWrap><AdminDrawings defaultTab="approvals" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/drawings/gfc" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Drawings">
          <LazyWrap><AdminDrawings defaultTab="gfc" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/employees" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Employees">
          <LazyWrap><AdminEmployees /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/employees/departments" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Employees">
          <LazyWrap><AdminEmployees /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/attendance/office" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><AdminAttendance tab="attendance" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/attendance/devices" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><AdminAttendance tab="devices" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/attendance/site" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><AdminAttendance tab="attendance" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/attendance/reports" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><AdminAttendance tab="attendance" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/hr/overview" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <LazyWrap><AdminHRPayroll defaultTab="overview" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/hr/leaves" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <LazyWrap><AdminHRPayroll defaultTab="leaves" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/hr/leave-master" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <LazyWrap><AdminHRPayroll defaultTab="leave-master" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/hr/shifts" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <LazyWrap><AdminHRPayroll defaultTab="shifts" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/hr/payroll" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <LazyWrap><AdminHRPayroll defaultTab="payroll" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/hr/performance" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <LazyWrap><AdminHRPayroll defaultTab="performance" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/hr/reviews" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="HR & Payroll">
          <LazyWrap><AdminHRPayroll defaultTab="performance" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/crm/overview" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <LazyWrap><AdminCRM defaultTab="leads" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/crm/leads" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <LazyWrap><AdminCRM defaultTab="leads" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/crm/clients" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <LazyWrap><AdminCRM defaultTab="clients" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/crm/queries" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <LazyWrap><AdminCRM defaultTab="queries" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/crm/approvals" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <LazyWrap><AdminCRM defaultTab="approvals" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/crm/projects" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Clients & CRM">
          <LazyWrap><AdminCRM defaultTab="clients" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/docs/projects" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Documents">
          <LazyWrap><AdminDocs defaultTab="vault" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/docs/global" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Documents">
          <LazyWrap><AdminDocs defaultTab="reports" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/reports/projects" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <LazyWrap><AdminAnalytics defaultTab="projects" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/reports/productivity" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <LazyWrap><AdminAnalytics defaultTab="productivity" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/reports/drawings" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <LazyWrap><AdminAnalytics defaultTab="drawings" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/reports/attendance" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <LazyWrap><AdminAnalytics defaultTab="attendance" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/reports/leaves" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <LazyWrap><AdminAnalytics defaultTab="leaves" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/reports/customers" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Analytics">
          <LazyWrap><AdminAnalytics defaultTab="projects" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/notifications" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Notifications">
          <LazyWrap><AdminNotifications /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/settings" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="Settings">
          <LazyWrap><AdminSettings /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/admin/bi" element={
        <DashboardLayout role="Admin" onChangeRole={handleRoleChange} title="BI & Future">
          <LazyWrap><AdminBI /></LazyWrap>
        </DashboardLayout>
      } />
    </>
  );
}
