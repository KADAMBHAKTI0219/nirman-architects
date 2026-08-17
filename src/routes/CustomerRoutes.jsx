import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import BrandLoader from '../components/common/BrandLoader';
import lazyWithRetry from '../utils/lazyWithRetry';

const CustomerDashboard = lazyWithRetry(() => import('../components/customer/dashboard/index'));
const CustomerTimeline = lazyWithRetry(() => import('../components/customer/timeline/index'));
const CustomerDrawings = lazyWithRetry(() => import('../components/customer/drawings/index'));
const CustomerPhotos3D = lazyWithRetry(() => import('../components/customer/photos-3d/index'));
const CustomerSupportQueries = lazyWithRetry(() => import('../components/customer/support-queries/index'));
const CustomerFeedback = lazyWithRetry(() => import('../components/customer/feedback/index'));
const CustomerChat = lazyWithRetry(() => import('../components/customer/chat-queries/index'));
const CustomerNotifications = lazyWithRetry(() => import('../components/customer/notifications/index'));
const CustomerHistory = lazyWithRetry(() => import('../components/customer/history/index'));

const LazyWrap = ({ children }) => (
  <Suspense fallback={<BrandLoader message="Loading Client Portal..." />}>
    {children}
  </Suspense>
);

export default function getCustomerRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/customer" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Customer Workspace">
          <LazyWrap><CustomerDashboard /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/timeline" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Project Timeline">
          <LazyWrap><CustomerTimeline /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/drawings" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Drawings">
          <LazyWrap><CustomerDrawings /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/drawings/approvals" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Drawings">
          <LazyWrap><CustomerDrawings /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/views" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Photos & 3D Views">
          <LazyWrap><CustomerPhotos3D /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/support-queries" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Support Queries">
          <LazyWrap><CustomerSupportQueries /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/feedback" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Client Feedback & Review">
          <LazyWrap><CustomerFeedback /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/chat" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Chat & Queries">
          <LazyWrap><CustomerChat /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/notifications" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Notifications">
          <LazyWrap><CustomerNotifications /></LazyWrap>
        </DashboardLayout>
      } />
      <Route path="/customer/history" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Project History">
          <LazyWrap><CustomerHistory /></LazyWrap>
        </DashboardLayout>
      } />
    </>
  );
}
