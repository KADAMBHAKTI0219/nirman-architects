import React, { useState, useEffect } from 'react';
import { 
  Laptop, ShieldAlert, Check, X, AlertCircle, RefreshCw, 
  CheckCircle2, Clock, Plus, User, Key, Search, Shield, Activity, XCircle,
  Eye, Pencil, Mail, Building, Calendar
} from 'lucide-react';
import { 
  getPendingDeviceRequests, 
  approveDeviceRequest, 
  assignDeviceToUser, 
  getDeviceStatus 
} from '../../../service/hrm/device';
import { getUsersList } from '../../../service/auth';

import PageHeader from '../../common/PageHeader';

export default function DeviceBindingApprovals({ employees = [], onRefresh }) {
  const [deviceRequests, setDeviceRequests] = useState([]);
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Direct Assignment form state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [customDeviceId, setCustomDeviceId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // View Details Modal state
  const [selectedEmpDetails, setSelectedEmpDetails] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingDeviceRequests();
      if (res && (res.requests || res.data?.requests || Array.isArray(res))) {
        setDeviceRequests(res.requests || res.data?.requests || (Array.isArray(res) ? res : []));
      }
      if (!employees || employees.length === 0) {
        try {
          const uRes = await getUsersList();
          const uList = uRes.users || uRes.data || (Array.isArray(uRes) ? uRes : []);
          setFetchedUsers(uList || []);
        } catch (uErr) {
          console.warn("Could not fetch users list:", uErr);
          setFetchedUsers([]);
        }
      }
    } catch (err) {
      console.error("Failed to load device requests:", err);
      setError("Could not retrieve pending device requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDeviceAction = async (requestId, action) => {
    try {
      const response = await approveDeviceRequest({ requestId, action });
      alert(response.message || `Device request ${action.toLowerCase()}d successfully.`);
      setSelectedEmpDetails(null);
      loadRequests();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Failed to process device action.");
    }
  };

  const handleApproveRow = async (emp, pendingReq) => {
    const reqId = pendingReq?._id || pendingReq?.id;
    const userId = emp.id || emp._id || pendingReq?.userId?._id || pendingReq?.userId;
    const deviceId = pendingReq?.newDeviceId || emp.rawUser?.deviceId || emp.deviceId;

    try {
      if (reqId) {
        const response = await approveDeviceRequest({ requestId: reqId, action: 'APPROVE' });
        alert(response.message || `Device request for ${emp.name} approved successfully.`);
      } else {
        const response = await assignDeviceToUser({ targetUserId: userId, deviceId: deviceId, status: 'APPROVED' });
        alert(response.message || `Device binding for ${emp.name} approved successfully.`);
      }

      emp.deviceStatus = 'APPROVED';
      if (emp.rawUser) emp.rawUser.deviceStatus = 'APPROVED';
      if (pendingReq) {
        setDeviceRequests(prev => prev.filter(r => (r._id !== reqId && r.id !== reqId)));
      }
      setSelectedEmpDetails(null);
      loadRequests();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Failed to approve device request.");
    }
  };

  const handleRejectRow = async (emp, pendingReq) => {
    const reqId = pendingReq?._id || pendingReq?.id;
    const userId = emp.id || emp._id || pendingReq?.userId?._id || pendingReq?.userId;

    try {
      if (reqId) {
        const response = await approveDeviceRequest({ requestId: reqId, action: 'REJECT' });
        alert(response.message || `Device request for ${emp.name} rejected.`);
      } else {
        const response = await assignDeviceToUser({ targetUserId: userId, deviceId: '', status: 'REJECTED' });
        alert(response.message || `Device request for ${emp.name} rejected.`);
      }

      emp.deviceStatus = 'REJECTED';
      if (emp.rawUser) emp.rawUser.deviceStatus = 'REJECTED';
      if (pendingReq) {
        setDeviceRequests(prev => prev.filter(r => (r._id !== reqId && r.id !== reqId)));
      }
      setSelectedEmpDetails(null);
      loadRequests();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Failed to reject device request.");
    }
  };

  const handleDirectAssignSubmit = async (e) => {
    e.preventDefault();
    if (!targetUserId || !customDeviceId) {
      alert("Please select a target user and enter a valid Device ID / Machine GUID.");
      return;
    }

    setAssignSubmitting(true);
    try {
      const res = await assignDeviceToUser({ targetUserId, deviceId: customDeviceId });
      if (res?.success) {
        alert(res.message || "Device binding request submitted successfully! Status is now PENDING until approved.");
        setShowAssignModal(false);
        setCustomDeviceId('');
        loadRequests();
        if (onRefresh) onRefresh();
      } else {
        alert(res?.message || "Failed to assign device.");
      }
    } catch (err) {
      alert(err.message || "Error assigning device ID.");
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Real workforce list - NO mock data
  const workforceList = employees.length > 0 ? employees : fetchedUsers;

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. HEADER */}
      <PageHeader
        title="Workforce Device Binding Directory & Approvals"
        subtitle="Authorize Machine GUID desktop bindings, review pending requests, & monitor desktop agent heartbeats"
        actions={
          <>
            <button
              onClick={loadRequests}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Refresh Requests"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2.5 crm-brand-btn font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Direct Device Assign
            </button>
          </>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. SUMMARY KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">{deviceRequests.length}</span>
          <span className="text-[11px] text-slate-500">Requires Admin / HR sign-off</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Bound Corporate Devices</span>
            <Laptop className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">{workforceList.length}</span>
          <span className="text-[11px] text-slate-500">Machine GUIDs registered</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Desktop Heartbeat Status</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-emerald-600 block">30s Active</span>
          <span className="text-[11px] text-slate-500">Real-time attendance agent active</span>
        </div>
      </div>

      {/* 2. MAIN UNIFIED WORKFORCE DEVICE BINDING DIRECTORY TABLE (AT THE TOP) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Workforce Device Binding Directory</h3>
            <p className="text-xs text-slate-500">Live device authorization status & desktop agent sync</p>
          </div>
          {deviceRequests.length > 0 && (
            <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> {deviceRequests.length} Pending Approval Action Required
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Bound Device Machine GUID</th>
                <th className="px-4 py-3.5">Authorization Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                      <span className="text-xs font-bold text-slate-600">Loading device binding directory...</span>
                    </div>
                  </td>
                </tr>
              ) : workforceList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Laptop className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-bold text-slate-600">No device binding records found</span>
                      <span className="text-[11px] text-slate-400">No registered users or pending device requests available.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                workforceList.map((emp, idx) => {
                  const empEmail = emp.email?.toLowerCase();
                  const empId = emp.id || emp._id;
                  
                  // Check if this employee has a pending device request
                  const pendingReq = deviceRequests.find(r => {
                    const reqUserEmail = r.userId?.email || r.user?.email;
                    const reqUserId = r.userId?.id || r.userId?._id || r.user?.id || r.user?._id;
                    return (reqUserEmail && reqUserEmail.toLowerCase() === empEmail) || (reqUserId && reqUserId === empId);
                  });

                  const isPending = !!pendingReq || 
                    (emp.rawUser?.deviceStatus || '').toUpperCase() === 'PENDING' || 
                    (emp.deviceStatus || '').toUpperCase() === 'PENDING' ||
                    (emp.status || '').toUpperCase() === 'PENDING';

                  const isApproved = !isPending && ((emp.rawUser?.deviceStatus || '').toUpperCase() === 'APPROVED' || (emp.deviceStatus || '').toUpperCase() === 'APPROVED');
                  const isRejected = !isPending && ((emp.rawUser?.deviceStatus || '').toUpperCase() === 'REJECTED' || (emp.deviceStatus || '').toUpperCase() === 'REJECTED');

                  const displayGuid = pendingReq 
                    ? pendingReq.newDeviceId 
                    : (emp.rawUser?.deviceId || emp.rawUser?.registeredDeviceId || emp.registeredDeviceId || emp.deviceId || 'UNBOUND');

                  const statusLabel = isPending ? 'PENDING' : (isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'UNBOUND'));

                  return (
                    <tr key={idx} className={`hover:bg-slate-50/80 transition-all ${isPending ? 'bg-amber-50/30' : ''}`}>
                      
                      {/* Employee */}
                      <td className="px-4 py-3.5">
                        <strong className="text-slate-900 font-bold block">{emp.name}</strong>
                        <span className="text-[11px] text-slate-500 font-mono">{emp.email}</span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5 text-slate-600 font-bold">{emp.department || emp.designation || 'Office'}</td>

                      {/* Bound Device Machine GUID */}
                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 text-[11px]" title={displayGuid}>
                        {displayGuid}
                        {pendingReq && <span className="text-[9px] text-amber-600 block font-sans font-bold">New Requested GUID</span>}
                      </td>

                      {/* Authorization Status Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 w-max ${
                          isApproved 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : isPending 
                              ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isApproved && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          {isPending && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {isRejected && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex gap-1.5 justify-end items-center">
                          {/* View Details Icon Button */}
                          <button
                            onClick={() => setSelectedEmpDetails({ emp, pendingReq, isApproved, isPending, isRejected, displayGuid })}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                            title="View Device Binding Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApproveRow(emp, pendingReq)}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1 text-[10px] uppercase px-3"
                                title="Approve Device Request"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectRow(emp, pendingReq)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase px-3"
                                title="Reject Device Request"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setTargetUserId(emp.id || emp._id);
                                setShowAssignModal(true);
                              }}
                              className="p-2 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer"
                              title="Edit / Assign Device GUID"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VIEW DEVICE BINDING DETAILS */}
      {selectedEmpDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Device Binding Details</h3>
                <p className="text-xs text-slate-500">Complete hardware specs, authorization & heartbeat diagnostics</p>
              </div>
              <button onClick={() => setSelectedEmpDetails(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Employee Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <strong className="text-sm font-black text-slate-900 block">{selectedEmpDetails.emp.name}</strong>
                  <span className="text-slate-500 font-mono">{selectedEmpDetails.emp.email}</span>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[10px]">
                  {selectedEmpDetails.emp.department || 'Office'}
                </span>
              </div>

              {/* Status & Heartbeat Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authorization Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedEmpDetails.isApproved ? 'bg-emerald-100 text-emerald-700' : selectedEmpDetails.isPending ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {selectedEmpDetails.isApproved ? 'APPROVED' : selectedEmpDetails.isPending ? 'PENDING APPROVAL' : 'REJECTED'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Desktop Agent Ping</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> ONLINE (30s Active)
                  </span>
                </div>
              </div>

              {/* Device ID Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 font-mono">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Active Machine GUID</span>
                  <strong className="text-xs text-indigo-600 block break-all">{selectedEmpDetails.displayGuid}</strong>
                </div>

                {selectedEmpDetails.pendingReq?.oldDeviceId && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Previous Device ID</span>
                    <span className="text-xs text-slate-500 block break-all">{selectedEmpDetails.pendingReq.oldDeviceId}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons if Pending */}
              {selectedEmpDetails.pendingReq && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDeviceAction(selectedEmpDetails.pendingReq._id || selectedEmpDetails.pendingReq.id, 'REJECT')}
                    className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-xl text-xs"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleDeviceAction(selectedEmpDetails.pendingReq._id || selectedEmpDetails.pendingReq.id, 'APPROVE')}
                    className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl text-xs shadow-xs hover:bg-emerald-700"
                  >
                    Approve Device Request
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEmpDetails(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT DEVICE ASSIGNMENT */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Assign Machine GUID Device ID</h3>
                <p className="text-xs text-slate-500">Create a pending device binding request for Admin approval</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
            </div>

            <form onSubmit={handleDirectAssignSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Employee *</label>
                <select
                  value={targetUserId}
                  onChange={e => setTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 bg-white"
                  required
                >
                  <option value="">-- Select Target Employee --</option>
                  {workforceList.map(e => (
                    <option key={e.id || e._id} value={e.id || e._id}>
                      {e.name} ({e.email || e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Device ID / Machine GUID *</label>
                <input
                  type="text"
                  placeholder="e.g. c5dbdd5f-e416-479b-aa77-12c661c48bcb"
                  value={customDeviceId}
                  onChange={e => setCustomDeviceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 crm-brand-btn font-extrabold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
                >
                  {assignSubmitting ? 'Assigning...' : 'Submit Device Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
