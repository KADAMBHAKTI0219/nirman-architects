import React from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';

import HRDashboard from '../components/hr/dashboard/index';
import HREmployees from '../components/hr/employees/index';
import HRAttendance from '../components/hr/attendance/index';
import HRLeaves from '../components/hr/leaves-holidays/index';
import HRShifts from '../components/hr/shifts/index';
import HRPayroll from '../components/hr/payroll-data/index';
import HRReviews from '../components/hr/reviews/index';
import HRDocs from '../components/hr/docs/index';
import AppUsageTracking from '../components/admin/app-usage/AppUsageTracking';

export default function getHrRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/hr/app-usage" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="App Usage Tracking">
          <AppUsageTracking userRole="HR" />
        </DashboardLayout>
      } />
      <Route path="/hr" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="HR Workspace">
          <HRDashboard />
        </DashboardLayout>
      } />
      <Route path="/hr/employees" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Employees">
          <HREmployees />
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/overview" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <HRAttendance defaultTab="overview" />
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/daily" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <HRAttendance defaultTab="daily" />
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/monthly" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <HRAttendance defaultTab="monthly" />
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/exceptions" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <HRAttendance defaultTab="exceptions" />
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/office" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <HRAttendance defaultTab="overview" />
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/site" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <HRAttendance defaultTab="overview" />
        </DashboardLayout>
      } />
      <Route path="/hr/attendance/reports" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Attendance">
          <HRAttendance defaultTab="overview" />
        </DashboardLayout>
      } />
      <Route path="/hr/leaves/company" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Leaves & Holidays">
          <HRLeaves defaultTab="company" />
        </DashboardLayout>
      } />
      <Route path="/hr/leaves/personal" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Leaves & Holidays">
          <HRLeaves defaultTab="personal" />
        </DashboardLayout>
      } />
      <Route path="/hr/leaves" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Leaves & Holidays">
          <HRLeaves defaultTab="company" />
        </DashboardLayout>
      } />
      <Route path="/hr/shifts" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Shifts">
          <HRShifts />
        </DashboardLayout>
      } />
      <Route path="/hr/payroll" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Payroll">
          <HRPayroll />
        </DashboardLayout>
      } />
      <Route path="/hr/reviews" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="Reviews">
          <HRReviews />
        </DashboardLayout>
      } />
      <Route path="/hr/docs" element={
        <DashboardLayout role="HR" onChangeRole={handleRoleChange} title="HR Documents">
          <HRDocs />
        </DashboardLayout>
      } />
    </>
  );
}
