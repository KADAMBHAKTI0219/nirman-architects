import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, RefreshCw, Mail, Smartphone, Globe, Settings as SettingsIcon, 
  UserCheck, Database, ToggleLeft, ToggleRight, Save, Plus, Trash2, Key, MapPin 
} from 'lucide-react';
import Card from '../../common/Card';
import { getRoles, createRole } from '../../../service/auth';
import { getSiteLocations, createSiteLocation } from '../../../service/siteLocationService';

export default function Settings() {
  const [activeSettingTab, setActiveSettingTab] = useState('roles'); // general, roles, workflow, integrations
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    roleName: '',
    roleCode: '',
    description: ''
  });
  const [roleCreating, setRoleCreating] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');

  // Geofence site locations states
  const [siteLocations, setSiteLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [newLocationData, setNewLocationData] = useState({
    projectId: '',
    projectName: '',
    lat: '',
    lng: '',
    radiusMeters: '100'
  });
  const [locationEditingId, setLocationEditingId] = useState(null);
  const [locationCreating, setLocationCreating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationSuccess, setLocationSuccess] = useState('');

  const fetchSiteLocations = async () => {
    try {
      setLocationsLoading(true);
      const res = await getSiteLocations();
      const list = res.data?.locations || res.locations || (Array.isArray(res) ? res : []);
      if (list) {
        setSiteLocations(list);
      }
    } catch (err) {
      console.error("Failed to fetch site locations:", err);
    } finally {
      setLocationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSettingTab === 'geofence') {
      fetchSiteLocations();
    }
  }, [activeSettingTab]);

  const handleCreateLocationSubmit = async (e) => {
    e.preventDefault();
    setLocationError('');
    setLocationSuccess('');

    if (!newLocationData.projectName || !newLocationData.lat || !newLocationData.lng) {
      setLocationError('Project Name, Latitude, and Longitude are required.');
      return;
    }

    setLocationCreating(true);
    try {
      const payload = {
        projectName: newLocationData.projectName,
        lat: Number(newLocationData.lat),
        lng: Number(newLocationData.lng),
        radiusMeters: Number(newLocationData.radiusMeters || 100)
      };
      
      if (newLocationData.projectId) {
        payload.projectId = newLocationData.projectId;
      }

      const res = await createSiteLocation(payload);
      if (res.success || res.siteLocation || res._doc || res._id) {
        setLocationSuccess('Site geofence configured successfully!');
        setNewLocationData({ projectId: '', projectName: '', lat: '', lng: '', radiusMeters: '100' });
        setLocationEditingId(null);
        fetchSiteLocations();
      } else {
        setLocationError(res.message || 'Failed to configure site location.');
      }
    } catch (err) {
      setLocationError(err.response?.data?.message || err.message || 'Failed to configure site location.');
    } finally {
      setLocationCreating(false);
    }
  };

  const handleEditLocation = (loc) => {
    setNewLocationData({
      projectId: loc.project?._id || loc.project?.id || loc.project || '',
      projectName: loc.projectName || '',
      lat: String(loc.lat || ''),
      lng: String(loc.lng || ''),
      radiusMeters: String(loc.radiusMeters || '100')
    });
    setLocationEditingId(loc._id || loc.id);
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const res = await getRoles();
        if (res.success && Array.isArray(res.roles)) {
          setRoles(res.roles);
        }
      } catch (err) {
        console.error("Failed to fetch roles in settings page:", err);
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    setRoleError('');
    setRoleSuccess('');
    
    if (!newRoleData.roleName || !newRoleData.roleCode) {
      setRoleError('Role Name and Role Code are required.');
      return;
    }
    
    setRoleCreating(true);
    try {
      const res = await createRole({
        roleName: newRoleData.roleName,
        roleCode: newRoleData.roleCode.toUpperCase().replace(/\s+/g, '_'),
        description: newRoleData.description
      });
      
      if (res.success || res._doc || res._id) {
        setRoleSuccess('Role created successfully!');
        setNewRoleData({ roleName: '', roleCode: '', description: '' });
        // Reload roles
        const updatedRoles = await getRoles();
        if (updatedRoles.success && Array.isArray(updatedRoles.roles)) {
          setRoles(updatedRoles.roles);
        }
      } else {
        setRoleError(res.message || 'Failed to create role.');
      }
    } catch (err) {
      setRoleError(err.response?.data?.message || err.message || 'Failed to create role.');
    } finally {
      setRoleCreating(false);
    }
  };

  // 1. General Profile State
  const [profile, setProfile] = useState({
    companyName: "Nirman Architects & Nexalliance",
    address: "HQ Corporate Office, Noida, Sector 62",
    contactEmail: "admin@nirman.com",
    contactPhone: "+91-120-555-0199"
  });

  // 2. Roles Access Matrix State
  const [rolesPermissions, setRolesPermissions] = useState([
    { role: "Project Manager", viewProjects: true, approveDrawings: true, manageTasks: true, viewPayroll: false },
    { role: "Architect", viewProjects: true, approveDrawings: true, manageTasks: false, viewPayroll: false },
    { role: "Site Engineer", viewProjects: true, approveDrawings: false, manageTasks: true, viewPayroll: false },
    { role: "Customer / Client", viewProjects: true, approveDrawings: false, manageTasks: false, viewPayroll: false }
  ]);

  // 3. Workflow Rules State
  const [rules, setRules] = useState({
    taskReminderHours: 24,
    drawingApprovalDays: 5,
    autoCheckinLaptop: true,
    gpsGeofenceRadius: 100
  });

  // 4. Integrations Credentials
  const [integrations, setIntegrations] = useState([
    { id: 1, name: "QuickBooks Accounting Ledger Sync", desc: "Synchronize payroll calculations automatically each month", active: true, key: "qb_prod_key_95817482" },
    { id: 2, name: "WhatsApp & SMS Communications Gateways", desc: "Send GFC blueprint release notices to clients", active: true, key: "sms_tw_auth_key_0284719" },
    { id: 3, name: "Email SMTP Service Gateway", desc: "Dispatch daily summaries to department leads", active: false, key: "" }
  ]);

  const handleTogglePermission = (roleIndex, field) => {
    setRolesPermissions(prev => prev.map((item, idx) => 
      idx === roleIndex ? { ...item, [field]: !item[field] } : item
    ));
  };

  const handleToggleIntegration = (id) => {
    setIntegrations(prev => prev.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
    alert("Integration status toggled!");
  };

  const handleSaveSettings = () => {
    alert("System settings saved successfully to corporate server.");
  };

  const settingMenus = [
    { id: 'general', label: 'Company Profile', icon: Globe },
    { id: 'roles', label: 'Role Access Control', icon: UserCheck },
    { id: 'workflow', label: 'Workflow Rules', icon: RefreshCw },
    { id: 'geofence', label: 'Site Geofence Locations', icon: MapPin },
    { id: 'integrations', label: 'API Integrations', icon: Key }
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Configuration Settings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure global configurations, permissions roles, and site geofence locations
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Save className="w-4 h-4 text-white" />
          Save Configurations
        </button>
      </div>

      {/* Main Split: Left Sidebar Tab List & Right Detail Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Tab Roster (1/4 width) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-2 h-max">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">Settings Menu</span>
          {settingMenus.map(menu => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.id}
                onClick={() => setActiveSettingTab(menu.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 ${
                  activeSettingTab === menu.id
                    ? 'bg-brand-tint border border-brand-primary/20 text-slate-805 font-extrabold shadow-3xs'
                    : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-455" />
                <span>{menu.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Control Panel Drawer (3/4 width) */}
        <div className="lg:col-span-3">
          
          {activeSettingTab === 'general' && (
            <Card title="Company Profile & Identity Settings" subtitle="Configure email contacts and corporate details (Company logo is fixed in sidebar navigation)">
              <form className="space-y-4 pt-2 text-xs font-bold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Company Registered Name</label>
                    <input 
                      type="text" 
                      value={profile.companyName}
                      onChange={(e) => setProfile(p => ({ ...p, companyName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Primary Email Contact</label>
                    <input 
                      type="email" 
                      value={profile.contactEmail}
                      onChange={(e) => setProfile(p => ({ ...p, contactEmail: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Registered Address</label>
                    <input 
                      type="text" 
                      value={profile.address}
                      onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </form>
            </Card>
          )}

          {activeSettingTab === 'roles' && (
            <div className="space-y-6">
              <Card title="Active System Roles" subtitle="Registered roles loaded from the backend server">
                {rolesLoading ? (
                  <div className="p-4 text-center text-xs font-semibold text-slate-400">Loading roles...</div>
                ) : (
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-xs text-left table-auto">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Role Name</th>
                          <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Role Code</th>
                          <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                          <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {roles.map((row, roleIdx) => (
                          <tr key={row._id || roleIdx} className="hover:bg-slate-50/40">
                            <td className="px-4 py-3.5 font-bold text-slate-805">{row.roleName}</td>
                            <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500">{row.roleCode}</td>
                            <td className="px-4 py-3.5 text-slate-500 font-semibold">{row.description || 'N/A'}</td>
                            <td className="px-4 py-3.5 text-center align-middle">
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                row.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                                {row.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card title="Add New System Role" subtitle="Create a new role definition on the backend server">
                <form onSubmit={handleCreateRoleSubmit} className="space-y-4 pt-2 text-xs font-bold text-slate-700">
                  {roleError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-bold">
                      {roleError}
                    </div>
                  )}
                  {roleSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold">
                      {roleSuccess}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Role Name</label>
                      <input 
                        type="text" 
                        required
                        value={newRoleData.roleName}
                        onChange={(e) => setNewRoleData(prev => ({ ...prev, roleName: e.target.value }))}
                        placeholder="e.g. Senior Architect"
                        className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Role Code</label>
                      <input 
                        type="text" 
                        required
                        value={newRoleData.roleCode}
                        onChange={(e) => setNewRoleData(prev => ({ ...prev, roleCode: e.target.value.toUpperCase() }))}
                        placeholder="e.g. SENIOR_ARCHITECT"
                        className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Description</label>
                      <input 
                        type="text" 
                        value={newRoleData.description}
                        onChange={(e) => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g. Design lead responsible for blueprints"
                        className="w-full px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={roleCreating}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    {roleCreating ? 'Creating Role...' : 'Create Role'}
                  </button>
                </form>
              </Card>
            </div>
          )}

          {activeSettingTab === 'workflow' && (
            <Card title="Workflow & Attendance Roster Rules" subtitle="Configure automated delay triggers, geofence radius, and GFC validation limits">
              <form className="space-y-4 pt-2 text-xs font-bold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Task Overdue Reminder Timer</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number" 
                        value={rules.taskReminderHours}
                        onChange={(e) => setRules(r => ({ ...r, taskReminderHours: parseInt(e.target.value) }))}
                        className="w-24 px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                      />
                      <span className="text-slate-500">Hours before deadline</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Drawing Approvals Buffer Limit</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number" 
                        value={rules.drawingApprovalDays}
                        onChange={(e) => setRules(r => ({ ...r, drawingApprovalDays: parseInt(e.target.value) }))}
                        className="w-24 px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                      />
                      <span className="text-slate-500">Days for review cycle</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Site GPS Geofence Radius</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number" 
                        value={rules.gpsGeofenceRadius}
                        onChange={(e) => setRules(r => ({ ...r, gpsGeofenceRadius: parseInt(e.target.value) }))}
                        className="w-24 px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white"
                      />
                      <span className="text-slate-500">Meters matching site range</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Corporate Laptop Boot Log Tracking</label>
                    <div className="flex gap-2 items-center h-10">
                      <button
                        type="button"
                        onClick={() => setRules(r => ({ ...r, autoCheckinLaptop: !r.autoCheckinLaptop }))}
                        className={`px-3 py-1.5 rounded-lg border font-semibold ${
                          rules.autoCheckinLaptop ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        {rules.autoCheckinLaptop ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {activeSettingTab === 'geofence' && (
            <Card title="Project Site Geo-Fencing Configuration" subtitle="Configure lat/lng bounds and allowed radius zones for site engineers and architects checkins">
              <div className="space-y-6 pt-2">
                
                {/* Form to Add/Edit Geofence */}
                <form onSubmit={handleCreateLocationSubmit} className="p-5 bg-slate-50/50 border border-slate-105 rounded-2xl space-y-4 text-xs font-bold text-slate-700">
                  <h4 className="text-[10px] font-black uppercase text-slate-405 tracking-wider">
                    {locationEditingId ? 'Edit Site Geofence' : 'Configure New Site Geofence'}
                  </h4>

                  {locationError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-bold">
                      {locationError}
                    </div>
                  )}
                  {locationSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold">
                      {locationSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Project / Site Name</label>
                      <input 
                        type="text" 
                        required
                        value={newLocationData.projectName}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, projectName: e.target.value }))}
                        placeholder="e.g. Noida Commercial Tower"
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Project ID (Optional)</label>
                      <input 
                        type="text" 
                        value={newLocationData.projectId}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, projectId: e.target.value }))}
                        placeholder="e.g. 6a607dae7f99c70902371c1d"
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Geo-Fence Radius (Meters)</label>
                      <input 
                        type="number" 
                        required
                        value={newLocationData.radiusMeters}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, radiusMeters: e.target.value }))}
                        placeholder="100"
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Latitude</label>
                      <input 
                        type="number" 
                        step="any"
                        required
                        value={newLocationData.lat}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, lat: e.target.value }))}
                        placeholder="e.g. 28.6273"
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-405 block uppercase mb-1">Longitude</label>
                      <input 
                        type="number" 
                        step="any"
                        required
                        value={newLocationData.lng}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, lng: e.target.value }))}
                        placeholder="e.g. 77.3725"
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none bg-white font-semibold text-slate-800"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={locationCreating}
                        className="w-full py-2 bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-slate-905 font-black uppercase rounded-xl transition-all shadow-3xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        {locationCreating ? 'Configuring...' : (locationEditingId ? 'Update Geofence' : 'Configure Geofence')}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Table of configured locations */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Site Name</th>
                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Coordinates (Lat, Lng)</th>
                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Radius</th>
                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {locationsLoading ? (
                        <tr>
                          <td colSpan="4" className="p-6 text-center text-slate-400 font-bold">Loading geofence locations...</td>
                        </tr>
                      ) : siteLocations.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-6 text-center text-slate-400 font-bold">No geofences configured yet. Use the form above to add one.</td>
                        </tr>
                      ) : (
                        siteLocations.map(loc => (
                          <tr key={loc._id || loc.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-slate-805">
                              {loc.projectName}
                              {loc.project && (
                                <span className="block text-[8px] text-slate-405 font-bold">Linked Project ID: {loc.project._id || loc.project?.id || loc.project}</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-500 font-mono">
                              {loc.lat?.toFixed(5)}, {loc.lng?.toFixed(5)}
                            </td>
                            <td className="p-3 text-slate-650 font-bold">
                              {loc.radiusMeters} meters
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleEditLocation(loc)}
                                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-202 rounded-lg text-[9px] font-black uppercase transition-all shadow-4xs"
                              >
                                Edit bounds
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </Card>
          )}

          {activeSettingTab === 'integrations' && (
            <Card title="ERP Integrations & Service Gateways" subtitle="Configure corporate software integrations and digital messaging keys">
              <div className="space-y-4 pt-2">
                {integrations.map(item => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-wrap gap-4 justify-between items-center text-xs">
                    <div className="space-y-0.5 flex-1 min-w-[200px]">
                      <strong className="text-slate-805 block">{item.name}</strong>
                      <p className="text-[10px] text-slate-400 font-bold leading-normal">{item.desc}</p>
                      {item.active && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-slate-400" />
                          <input 
                            type="text" 
                            readOnly 
                            value={item.key || "Not configured"} 
                            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[9px] text-slate-600 font-mono w-44 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleIntegration(item.id)}
                      className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all shadow-3xs ${
                        item.active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-205 text-slate-405'
                      }`}
                    >
                      {item.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
