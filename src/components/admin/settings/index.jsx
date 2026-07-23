import React, { useState } from 'react';
import { 
  ShieldCheck, RefreshCw, Mail, Smartphone, Globe, Settings as SettingsIcon, 
  UserCheck, Database, ToggleLeft, ToggleRight, Save, Plus, Trash2, Key 
} from 'lucide-react';
import Card from '../../common/Card';

export default function Settings() {
  const [activeSettingTab, setActiveSettingTab] = useState('roles'); // general, roles, workflow, integrations

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
    { id: 'integrations', label: 'API Integrations', icon: Key }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Settings Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">System Configuration Settings</h2>
          <p className="text-xs text-slate-400">Configure global configurations, permissions roles, and QuickBooks API hooks</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
        >
          <Save className="w-4 h-4" />
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
            <Card title="Company Profile & Identity Settings" subtitle="Configure logo configurations, email contacts, and corporate details">
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
            <Card title="Role Access Permissions Matrix" subtitle="Map functional access constraints across system roles">
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs text-left table-auto">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">System Role</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">View Projects</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Approve GFC</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Manage Tasks</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">View Payroll</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rolesPermissions.map((row, roleIdx) => (
                      <tr key={roleIdx} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3.5 font-bold text-slate-805">{row.role}</td>
                        
                        <td className="px-4 py-3.5 text-center align-middle">
                          <input 
                            type="checkbox" 
                            checked={row.viewProjects}
                            onChange={() => handleTogglePermission(roleIdx, 'viewProjects')}
                            className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3.5 text-center align-middle">
                          <input 
                            type="checkbox" 
                            checked={row.approveDrawings}
                            onChange={() => handleTogglePermission(roleIdx, 'approveDrawings')}
                            className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3.5 text-center align-middle">
                          <input 
                            type="checkbox" 
                            checked={row.manageTasks}
                            onChange={() => handleTogglePermission(roleIdx, 'manageTasks')}
                            className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3.5 text-center align-middle">
                          <input 
                            type="checkbox" 
                            checked={row.viewPayroll}
                            onChange={() => handleTogglePermission(roleIdx, 'viewPayroll')}
                            className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4"
                          />
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
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
