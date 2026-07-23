import React from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';

import CustomerDashboard from '../components/customer/dashboard/index';
import CustomerTimeline from '../components/customer/timeline/index';
import CustomerDrawings from '../components/customer/drawings/index';
import CustomerPhotos3D from '../components/customer/photos-3d/index';
import CustomerChat from '../components/customer/chat-queries/index';
import CustomerNotifications from '../components/customer/notifications/index';
import CustomerHistory from '../components/customer/history/index';

export default function getCustomerRoutes(handleRoleChange) {
  return (
    <>
      <Route path="/customer" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Customer Workspace">
          <CustomerDashboard />
        </DashboardLayout>
      } />
      <Route path="/customer/timeline" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Project Timeline">
          <CustomerTimeline />
        </DashboardLayout>
      } />
      <Route path="/customer/drawings" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Drawings">
          <CustomerDrawings />
        </DashboardLayout>
      } />
      <Route path="/customer/drawings/approvals" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Drawings">
          <CustomerDrawings />
        </DashboardLayout>
      } />
      <Route path="/customer/views" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Photos & 3D Views">
          <CustomerPhotos3D />
        </DashboardLayout>
      } />
      <Route path="/customer/chat" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Chat & Queries">
          <CustomerChat />
        </DashboardLayout>
      } />
      <Route path="/customer/notifications" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Notifications">
          <CustomerNotifications />
        </DashboardLayout>
      } />
      <Route path="/customer/history" element={
        <DashboardLayout role="Customer" onChangeRole={handleRoleChange} title="Project History">
          <CustomerHistory />
        </DashboardLayout>
      } />
    </>
  );
}
