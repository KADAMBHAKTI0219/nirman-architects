import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { getAttendanceStatus, siteCheckin, clockOfficeEvent } from './mockApi';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
  const [role, setRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return 'Admin';
      
      const parsedUser = JSON.parse(savedUser);
      const rawRole = parsedUser.roleCode || parsedUser.role || 'Employee';
      
      // Normalize role to match React router definitions
      const r = rawRole.toLowerCase().trim();
      if (r.includes('admin') || r.includes('super_admin') || r.includes('super admin')) return 'Admin';
      if (r === 'hr') return 'HR';
      if (r.includes('site') || r.includes('engineer') || r === 'site_engineer') return 'SiteEngineer';
      if (r.includes('manager') || r === 'project_manager') return 'ProjectManager';
      if (r.includes('architect')) return 'Architect';
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

  // 1. Check existing session status on app mount to prevent duplicate clock-ins on page refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const triggerAutoClockIn = async () => {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return;

      // If user is already checked in during this session, do not re-trigger clock in on page refresh!
      if (localStorage.getItem('isCheckedIn') === 'true') {
        console.log("Global Attendance: Session already active (Checked In). Skipping refresh clock-in.");
        return;
      }

      const user = JSON.parse(savedUser);
      const isSiteEngineer = user.role?.toLowerCase().includes('site');

      try {
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

  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes 
          role={role} 
          setRole={setRole} 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
        />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

