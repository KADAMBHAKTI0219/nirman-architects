import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { getAttendanceStatus, siteCheckin, clockOfficeEvent } from './services/attendance.api';
import './App.css';

function App() {
  const [role, setRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const rawRole = savedUser ? JSON.parse(savedUser).role : 'Admin';
      
      // Normalize role to match React router definitions
      if (!rawRole) return 'Employee';
      const r = rawRole.toLowerCase().trim();
      if (r.includes('admin') || r.includes('super admin')) return 'Admin';
      if (r.includes('hr')) return 'HR';
      if (r.includes('manager') && !r.includes('site')) return 'ProjectManager';
      if (r.includes('architect')) return 'Architect';
      if (r.includes('engineer') || r.includes('site manager')) return 'SiteEngineer';
      if (r.includes('customer')) return 'Customer';
      return 'Employee';
    } catch {
      return 'Admin';
    }
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const coordsRef = useRef({ lat: 23.0225, lng: 72.5714 });

  // 1. Global Auto Clock-In upon opening the laptop dashboard (any page/route)
  useEffect(() => {
    if (!isAuthenticated) return;

    const triggerAutoClockIn = async () => {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return;

      const user = JSON.parse(savedUser);
      const isSiteEngineer = user.role?.toLowerCase().includes('site');

      try {
        // Check status first to prevent duplicate logins
        const statusRes = await getAttendanceStatus(user.id);
        if (statusRes.success && statusRes.data?.isOnline) {
          console.log("Global Auto-Attendance: User already online.");
          localStorage.setItem('isCheckedIn', 'true');
          return;
        }

        if (isSiteEngineer) {
          if (!navigator.geolocation) {
            console.warn("Geolocation not supported on this browser.");
            return;
          }
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              coordsRef.current = { lat, lng };
              await siteCheckin(
                user.id, 
                '6a607dae7f99c70902371c1d', 
                lat, 
                lng, 
                "https://storage.nirman.com/selfies/auto_checkin.jpg"
              );
              localStorage.setItem('isCheckedIn', 'true');
              console.log("Global Auto-Attendance: Site Engineer clocked in successfully.");
            },
            (err) => {
              console.error("GPS coords denied for Site Engineer:", err.message);
            }
          );
        } else {
          // Employee clocks in directly and immediately without waiting for GPS!
          await clockOfficeEvent(
            user.id, 
            user.registeredDeviceId || 'c5dbdd5f-e416-479b-aa77-12c661c48bcb', 
            'CLOCK_IN', 
            'SYSTEM_BOOT', 
            new Date().toISOString()
          );
          localStorage.setItem('isCheckedIn', 'true');
          console.log("Global Auto-Attendance: Employee clocked in successfully.");
        }
      } catch (err) {
        console.error("Global Auto-Attendance clock-in failed:", err);
      }
    };

    triggerAutoClockIn();
  }, [isAuthenticated]);

  // 2. Global Auto Clock-Out upon closing browser tab or laptop shutdown
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUnload = () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!savedUser || !token) return;

      const user = JSON.parse(savedUser);
      const isSiteEngineer = user.role?.toLowerCase().includes('site');
      const baseUrl = 'https://nirman-architects.onrender.com/api';
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (isSiteEngineer) {
        fetch(`${baseUrl}/attendance/site/checkout`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            projectId: '6a607dae7f99c70902371c1d',
            lat: coordsRef.current.lat,
            lng: coordsRef.current.lng
          }),
          keepalive: true
        });
      } else {
        fetch(`${baseUrl}/attendance/office/event`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId: user.id,
            deviceId: user.registeredDeviceId || 'c5dbdd5f-e416-479b-aa77-12c661c48bcb',
            type: 'CLOCK_OUT',
            source: 'SYSTEM_SHUTDOWN',
            time: new Date().toISOString()
          }),
          keepalive: true
        });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <AppRoutes 
        role={role} 
        setRole={setRole} 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
      />
    </BrowserRouter>
  );
}

export default App;
