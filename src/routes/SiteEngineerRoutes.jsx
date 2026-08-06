import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import BrandLoader from '../components/common/BrandLoader';

const SiteDashboard = lazy(() => import('../components/site-engineer/dashboard/index'));
const SiteList = lazy(() => import('../components/site-engineer/sites/index'));
const SiteAttendance = lazy(() => import('../components/site-engineer/attendance/index'));
const SitePhotosIssues = lazy(() => import('../components/site-engineer/photos-issues/index'));
const SiteUpdates = lazy(() => import('../components/site-engineer/client-updates/index'));
const SiteNotifications = lazy(() => import('../components/site-engineer/notifications/index'));
const LeavesPortal = lazy(() => import('../components/common/LeavesPortal'));

const LazyWrap = ({ children }) => (
  <Suspense fallback={<BrandLoader message="Loading Site Operations..." />}>
    {children}
  </Suspense>
);

export default function getSiteEngineerRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/site-engineer" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Site Engineer">
          <LazyWrap><SiteDashboard /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/site-engineer/leaves" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Leaves Portal">
          <LazyWrap><LeavesPortal /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/site-engineer/sites" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Sites">
          <LazyWrap><SiteList /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/site-engineer/sites/progress" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Sites">
          <LazyWrap><SiteList /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/site-engineer/attendance" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Site Attendance">
          <LazyWrap><SiteAttendance /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/site-engineer/photos" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Photos & Issues">
          <LazyWrap><SitePhotosIssues /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/site-engineer/updates" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Client Updates">
          <LazyWrap><SiteUpdates /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/site-engineer/notifications" element={
        <DashboardLayout role="SiteEngineer" onChangeRole={handleRoleChange} title="Notifications">
          <LazyWrap><SiteNotifications /></LazyWrap>
        </DashboardLayout>
      } />
    </>
  );
}
