import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, ShieldAlert, Check, X, AlertCircle } from 'lucide-react';
import AttendanceOps from './AttendanceOps';
import EmployeesHR from './EmployeesHR';
import { getAllAttendance } from '../../../services/attendance.api';
import { getPendingDeviceRequests, approveDevice } from '../../../services/device.api';
import { getUsers } from '../../../services/auth.api';

export default function WorkforceCommandCenter({ defaultTab = 'attendance' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [employees, setEmployees] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [deviceRequests, setDeviceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected details
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch real company attendance logs
      const logsRes = await getAllAttendance();
      let rawLogs = [];
      if (logsRes.success && logsRes.logs) {
        rawLogs = logsRes.logs;
        const mappedLogs = rawLogs.map(log => ({
          id: log.id || log._id,
          employeeId: log.id || log._id,
          name: log.employeeName || log.userEmail?.split('@')[0] || 'User',
          role: log.role || 'Staff Member',
          timeIn: log.type === 'CLOCK_IN' ? new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          timeOut: log.type === 'CLOCK_OUT' ? new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          hours: log.type === 'CLOCK_IN' ? 'Active' : 'Completed',
          mode: log.mode === 'OFFICE_AUTO' ? 'Office' : 'Site',
          status: log.isOffline ? 'Offline' : (log.autoClosed ? 'Auto-Closed' : 'Present')
        }));
        setAttendanceLogs(mappedLogs);
        if (mappedLogs.length > 0) {
          setSelectedLog(mappedLogs[0]);
        }
      }

      // 2. Fetch all registered corporate users via getUsers()
      const usersRes = await getUsers();
      const usersList = usersRes.users || usersRes.data || (Array.isArray(usersRes) ? usersRes : []);
      if (usersList) {
        const mappedEmployees = usersList.map(u => {
          const userEmail = u.email?.toLowerCase();
          const activeLog = rawLogs.find(l => l.userEmail?.toLowerCase() === userEmail);
          
          return {
            id: u.id || u._id,
            name: u.name || 'User',
            designation: u.role || 'Staff Member',
            department: u.department || 'Main Office',
            shift: u.role?.toLowerCase().includes('site') ? 'Site Shift B (8:00 - 16:30)' : 'Office Shift A (9:00 - 17:30)',
            attendanceStatus: activeLog ? (activeLog.type === 'CLOCK_IN' ? 'Active' : 'Checked-Out') : 'Absent',
            leaveStatus: 'On Duty',
            performanceBadge: 'Good (80%)',
            lastActive: activeLog ? new Date(activeLog.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            joiningDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            leaveHistory: '0 / 15 days used',
            payrollData: { salary: '$4,000/mo', bank: 'Nirman Bank' },
            assignedProjects: u.role?.toLowerCase().includes('site') ? ['Noida Site'] : ['Main Office'],
            documents: ['Contract_Signed.pdf']
          };
        });
        setEmployees(mappedEmployees);
        if (mappedEmployees.length > 0) {
          setSelectedEmployee(mappedEmployees[0]);
        }
      }

      // 3. Fetch pending device binding requests
      const deviceRes = await getPendingDeviceRequests();
      const requestsList = deviceRes.requests || deviceRes.data?.requests || (Array.isArray(deviceRes) ? deviceRes : []);
      setDeviceRequests(requestsList);
    } catch (err) {
      console.error("Failed to load command center data:", err);
      setError("Error synchronizing dynamic workforce data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeviceAction = async (requestId, action) => {
    try {
      const response = await approveDevice(requestId, action);
      alert(response.message || `Device request ${action.toLowerCase()}d successfully.`);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to process device action.");
    }
  };

  const handleAddEmployee = () => {
    navigate('/register');
  };

  // Live Alerts calculated from actual logs
  const liveAlerts = attendanceLogs.slice(0, 5).map((log, idx) => ({
    id: idx,
    type: log.mode,
    time: log.timeIn !== 'N/A' ? log.timeIn : log.timeOut,
    message: `${log.name} logged ${log.timeIn !== 'N/A' ? 'check-in' : 'check-out'} via ${log.mode === 'Office' ? 'laptop registry' : 'mobile GPS'}.`
  }));

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-2 flex-wrap gap-4 bg-slate-50/20 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'attendance'
                ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Attendance Operations
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'employees'
                ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Employees Directory
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
              activeTab === 'devices'
                ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Device Approvals
            {deviceRequests.length > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                {deviceRequests.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Workforce Command Center
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-605 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Render Active View */}
      <div>
        {activeTab === 'attendance' && (
          <AttendanceOps 
            attendanceLogs={attendanceLogs}
            liveAlerts={liveAlerts}
            onSelectEmployee={setSelectedLog}
            selectedEmployee={selectedLog}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesHR 
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={setSelectedEmployee}
            onAddEmployeeClick={handleAddEmployee}
          />
        )}

        {activeTab === 'devices' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">Workforce Device Binding Approvals</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Approve secondary device bindings and hardware changes</p>
            </div>
            {deviceRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No pending device change requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left table-auto">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Email</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Old Device ID</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested Device ID</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested At</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-55">
                    {deviceRequests.map(req => (
                      <tr key={req._id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3.5 font-bold text-slate-805">
                          {req.user?.email || 'Unknown User'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-mono text-[10px]" title={req.oldDeviceId}>
                          {req.oldDeviceId}
                        </td>
                        <td className="px-4 py-3.5 text-rose-600 font-mono text-[10px]" title={req.newDeviceId}>
                          {req.newDeviceId}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-semibold">
                          {new Date(req.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDeviceAction(req._id, 'APPROVE')}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-705 border border-emerald-200 rounded-lg text-[9px] font-black uppercase transition-all shadow-3xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeviceAction(req._id, 'REJECT')}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-705 border border-rose-200 rounded-lg text-[9px] font-black uppercase transition-all shadow-3xs"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
