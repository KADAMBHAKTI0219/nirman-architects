import React from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';

import SiteDashboard from '../components/site-engineer/dashboard/index';
import SiteList from '../components/site-engineer/sites/index';
import SiteAttendance from '../components/site-engineer/attendance/index';
import SitePhotosIssues from '../components/site-engineer/photos-issues/index';
import SiteUpdates from '../components/site-engineer/client-updates/index';
import SiteNotifications from '../components/site-engineer/notifications/index';
import LeavesPortal from '../components/common/LeavesPortal';

export default function getSiteEngineerRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/site-engineer" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Site Engineer">
          <SiteDashboard />
        </DashboardLayout>
      } />
      <Route path="/site-engineer/leaves" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Leaves Portal">
          <LeavesPortal />
        </DashboardLayout>
      } />
      <Route path="/site-engineer/sites" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Sites">
          <SiteList />
        </DashboardLayout>
      } />
      <Route path="/site-engineer/sites/progress" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Sites">
          <SiteList />
        </DashboardLayout>
      } />
      <Route path="/site-engineer/attendance" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Site Attendance">
          <SiteAttendance />
        </DashboardLayout>
      } />
      <Route path="/site-engineer/photos" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Photos & Issues">
          <SitePhotosIssues />
        </DashboardLayout>
      } />
      <Route path="/site-engineer/updates" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Client Updates">
          <SiteUpdates />
        </DashboardLayout>
      } />
      <Route path="/site-engineer/notifications" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Notifications">
          <SiteNotifications />
        </DashboardLayout>
      } />
    </>
  );
}
