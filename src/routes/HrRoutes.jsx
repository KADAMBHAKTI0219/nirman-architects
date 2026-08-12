import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import BrandLoader from '../components/common/BrandLoader';

const HRDashboard = lazy(() => import('../components/hr/dashboard/index'));
const HREmployees = lazy(() => import('../components/hr/employees/index'));
const HRAttendance = lazy(() => import('../components/hr/attendance/index'));
const HRLeaves = lazy(() => import('../components/hr/leaves-holidays/index'));
const HRPayroll = lazy(() => import('../components/hr/payroll-data/index'));
const HRReviews = lazy(() => import('../components/hr/reviews/index'));
const HRDocs = lazy(() => import('../components/hr/docs/index'));
const AppUsageTracking = lazy(() => import('../components/admin/app-usage/AppUsageTracking'));

const LazyWrap = ({ children }) => (
  <Suspense fallback={<BrandLoader message="Loading HR Workspace..." />}>
    {children}
  </Suspense>
);

export default function getHrRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/hr/app-usage" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="App Usage Tracking">
          <LazyWrap><AppUsageTracking userRole="HR" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="HR Workspace">
          <LazyWrap><HRDashboard /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/employees" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Employees">
          <LazyWrap><HREmployees /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/overview" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><HRAttendance defaultTab="overview" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/daily" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><HRAttendance defaultTab="daily" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/monthly" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><HRAttendance defaultTab="monthly" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/exceptions" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><HRAttendance defaultTab="exceptions" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/office" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><HRAttendance defaultTab="overview" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/site" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><HRAttendance defaultTab="overview" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/reports" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <LazyWrap><HRAttendance defaultTab="overview" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/leaves/company" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Leaves & Holidays">
          <LazyWrap><HRLeaves defaultTab="company" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/leaves/personal" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Leaves & Holidays">
          <LazyWrap><HRLeaves defaultTab="personal" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/leaves" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Leaves & Holidays">
          <LazyWrap><HRLeaves defaultTab="company" /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/payroll" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Payroll">
          <LazyWrap><HRPayroll /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/reviews" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Reviews">
          <LazyWrap><HRReviews /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/hr/docs" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="HR Documents">
          <LazyWrap><HRDocs /></LazyWrap>
        </DashboardLayout>
      } />
    </>
  );
}
