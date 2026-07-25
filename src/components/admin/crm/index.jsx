import React, { useState } from 'react';
import CRMOverview from './CRMOverview';
import CRMClientList from './CRMClientList';
import CRMClientProfile from './CRMClientProfile';
import CRMQueries from './CRMQueries';
import CRMApprovals from './CRMApprovals';

// Mock DB Initial Data
const INITIAL_CLIENTS = [
  {
    id: "CLI-101",
    name: "Mr. Bruce Wayne",
    company: "Wayne Enterprises",
    phone: "+1-415-555-0199",
    email: "bruce@waynecorp.com",
    address: "Wayne Manor, Gotham City",
    status: "Active",
    queriesCount: 1,
    pendingApprovals: 1,
    internalNotes: "VIP client. Critical underground parking concrete load calculations.",
    projects: [
      { projectName: "Oceanic Luxury Villas", progress: 75, startDate: "2025-10-10", timeline: "12 months" }
    ],
    sharedFiles: [
      { name: "Underground_Parking_Concept.pdf", type: "PDF", date: "2026-07-15" },
      { name: "Foundation_compaction_report.xlsx", type: "XLSX", date: "2026-07-20" }
    ],
    queries: [
      { title: "Layout of underground parking 3D render", description: "Requesting detailed 3D elevations of the cave structural layout under the garage.", assignedStaff: "John Wick", status: "Open" }
    ],
    chats: [
      { sender: "Bruce Wayne", message: "Any updates on the cave concrete loading calculations?", time: "10:15 AM" },
      { sender: "Alice Smith (You)", message: "Starting deadweight calculations check now.", time: "11:20 AM" }
    ]
  },
  {
    id: "CLI-102",
    name: "Lex Luthor",
    company: "Metropolis Corp",
    phone: "+1-212-555-0100",
    email: "lex@metropolis.com",
    address: "Luthor Tower, Metropolis",
    status: "Active",
    queriesCount: 0,
    pendingApprovals: 0,
    internalNotes: "High profile corporate client. Prefers weekly phone summaries.",
    projects: [
      { projectName: "Central Office Tower", progress: 60, startDate: "2026-01-15", timeline: "24 months" }
    ],
    sharedFiles: [
      { name: "Electrical_Schematics_GFC.dwg", type: "DWG", date: "2026-07-20" }
    ],
    queries: [],
    chats: []
  }
];

const INITIAL_QUERIES = [
  {
    id: 1,
    title: "Layout of underground parking 3D render",
    description: "Requesting detailed 3D elevations of the cave structural layout under the garage.",
    clientName: "Mr. Bruce Wayne",
    projectName: "Oceanic Luxury Villas",
    priority: "High",
    status: "Open",
    replies: [
      { author: "Alice Smith", text: "Starting garage structural deadweight checks now.", date: "1 day ago" }
    ]
  }
];

const INITIAL_APPROVALS = [
  {
    id: 1,
    title: "Central Office Tower Glass Facade Specifications",
    version: "V1.0",
    type: "PDF",
    clientName: "Lex Luthor",
    projectName: "Central Office Tower",
    date: "2026-07-18",
    remarks: "Approved pending GFC releasing schedule.",
    status: "Approved"
  },
  {
    id: 2,
    title: "Underground Parking Structural Support Release",
    version: "V1.2",
    type: "PDF",
    clientName: "Mr. Bruce Wayne",
    projectName: "Oceanic Luxury Villas",
    date: "2026-07-22",
    remarks: "Awaiting cave concrete loading verification.",
    status: "Awaiting Response"
  }
];

export default function CRM() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, clients, queries, approvals

  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [queriesList, setQueriesList] = useState(INITIAL_QUERIES);
  const [approvalsList, setApprovalsList] = useState(INITIAL_APPROVALS);

  // Selector state
  const [selectedClient, setSelectedClient] = useState(INITIAL_CLIENTS[0]);

  const handleUpdateClientNotes = (clientId, newNotes) => {
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, internalNotes: newNotes } : c
    ));
    if (selectedClient && selectedClient.id === clientId) {
      setSelectedClient(prev => ({ ...prev, internalNotes: newNotes }));
    }
  };

  const handleResolveQuery = (queryId) => {
    setQueriesList(prev => prev.map(q => 
      q.id === queryId ? { ...q, status: 'Resolved' } : q
    ));
    // update client side query count representation
    setClients(prev => prev.map(c => {
      if (c.queries.some(q => q.title === INITIAL_QUERIES.find(iq => iq.id === queryId)?.title)) {
        return {
          ...c,
          queriesCount: Math.max(0, c.queriesCount - 1),
          queries: c.queries.map(q => q.title === INITIAL_QUERIES.find(iq => iq.id === queryId)?.title ? { ...q, status: 'Resolved' } : q)
        };
      }
      return c;
    }));
    alert("Query marked resolved!");
  };

  const handleReplyQuery = (queryId, replyText) => {
    const newReply = {
      author: "Admin Support",
      text: replyText,
      date: "Just now"
    };
    setQueriesList(prev => prev.map(q => 
      q.id === queryId ? { ...q, replies: [...q.replies, newReply] } : q
    ));
  };

  const handleApproveRelease = (appId) => {
    setApprovalsList(prev => prev.map(app => 
      app.id === appId ? { ...app, status: 'Approved' } : app
    ));
    alert("Client approval release confirmed!");
  };

  const handleRejectRelease = (appId) => {
    setApprovalsList(prev => prev.map(app => 
      app.id === appId ? { ...app, status: 'Rejected' } : app
    ));
    alert("Client approval release rejected.");
  };

  const handleAddClientSubmit = () => {
    const name = prompt("Enter Client Name:");
    const company = prompt("Enter Company Name:");
    const phone = prompt("Enter Contact Phone:");
    
    if (name && company && phone) {
      const newId = `CLI-${100 + clients.length + 1}`;
      const newClient = {
        id: newId,
        name,
        company,
        phone,
        email: `${name.toLowerCase().replace(' ', '')}@company.com`,
        address: "HQ Corporate Office, New Delhi",
        status: "Active",
        queriesCount: 0,
        pendingApprovals: 0,
        internalNotes: "Newly registered client.",
        projects: [],
        sharedFiles: [],
        queries: [],
        chats: []
      };
      setClients(prev => [...prev, newClient]);
      alert(`Client ${newId} registered successfully!`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'CRM Overview' },
    { id: 'clients', label: 'Client Directory' },
    { id: 'queries', label: 'Support Queries' },
    { id: 'approvals', label: 'Client Approvals' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Sub-tab Navigation */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-2 flex-wrap gap-4 bg-slate-50/20 p-2 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                activeTab === t.id
                  ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                  : 'bg-white border-slate-205 text-slate-555 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Client Operations Desk
        </div>
      </div>

      {/* Render selected CRM module section */}
      <div>
        {activeTab === 'overview' && (
          <CRMOverview 
            clients={clients}
            queriesList={queriesList}
            approvalsList={approvalsList}
          />
        )}

        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CRMClientList 
                clients={clients}
                selectedClient={selectedClient}
                onSelectClient={setSelectedClient}
                onAddClientClick={handleAddClientSubmit}
              />
            </div>
            <div>
              {selectedClient ? (
                <CRMClientProfile 
                  client={selectedClient}
                  onUpdateClientNotes={handleUpdateClientNotes}
                />
              ) : (
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-center text-slate-400">
                  Select a client from the directory table to inspect their linked projects, files, and chats.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'queries' && (
          <CRMQueries 
            queriesList={queriesList}
            onResolveQuery={handleResolveQuery}
            onReplyQuery={handleReplyQuery}
          />
        )}

        {activeTab === 'approvals' && (
          <CRMApprovals 
            approvalsList={approvalsList}
            onApproveRelease={handleApproveRelease}
            onRejectRelease={handleRejectRelease}
          />
        )}
      </div>

    </div>
  );
}
