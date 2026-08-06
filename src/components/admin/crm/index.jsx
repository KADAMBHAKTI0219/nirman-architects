import React, { useState, useEffect } from 'react';
import CRMOverview from './CRMOverview';
import CRMLeadManagement from './CRMLeadManagement';
import CRMClientList from './CRMClientList';
import CRMClientProfile from './CRMClientProfile';
import CRMQueries from './CRMQueries';
import CRMApprovals from './CRMApprovals';
import { getClients } from '../../../service/client';

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

const INITIAL_MOCK_CLIENTS = [
  {
    _id: "CLI-901",
    id: "CLI-901",
    name: "Lex Luthor",
    companyName: "Luthor Corp Real Estate",
    phone: "9898989898",
    email: "lex@luthorcorp.com",
    billingAddress: "77 Metropolis Tower Way",
    status: "Active",
    createdAt: "2026-01-10",
    assignedProjects: ["Central Office Tower"],
    contacts: [
      {
        _id: "cnt-1",
        contactName: "Lex Luthor",
        contactEmail: "lex@luthorcorp.com",
        contactPhone: "9898989898",
        roleTag: "OWNER",
        mustChangePassword: true
      }
    ]
  },
  {
    _id: "CLI-902",
    id: "CLI-902",
    name: "Mr. Bruce Wayne",
    companyName: "Wayne Enterprises Ltd",
    phone: "9876543210",
    email: "bruce@wayneent.com",
    billingAddress: "Wayne Manor, Gotham City",
    status: "Active",
    createdAt: "2026-02-15",
    assignedProjects: ["Oceanic Luxury Villas"],
    contacts: [
      {
        _id: "cnt-2",
        contactName: "Mr. Bruce Wayne",
        contactEmail: "bruce@wayneent.com",
        contactPhone: "9876543210",
        roleTag: "OWNER",
        mustChangePassword: false
      }
    ]
  }
];

export default function CRM({ defaultTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [clients, setClients] = useState(INITIAL_MOCK_CLIENTS);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(INITIAL_MOCK_CLIENTS[0]);

  const [queriesList, setQueriesList] = useState(INITIAL_QUERIES);
  const [approvalsList, setApprovalsList] = useState(INITIAL_APPROVALS);

  useEffect(() => {
    fetchClientsList();
  }, []);

  const fetchClientsList = async () => {
    setClientsLoading(true);
    try {
      const res = await getClients();
      if (res?.success && Array.isArray(res.clients) && res.clients.length > 0) {
        const clientList = res.clients;
        setClients(clientList);
        if (clientList.length > 0) {
          setSelectedClient(prev => {
            if (!prev) return clientList[0];
            const updated = clientList.find(c => (c._id || c.id) === (prev._id || prev.id));
            return updated || clientList[0];
          });
        }
      } else {
        setClients(INITIAL_MOCK_CLIENTS);
        setSelectedClient(INITIAL_MOCK_CLIENTS[0]);
      }
    } catch (err) {
      console.warn("Backend client API offline - Using fallback INITIAL_MOCK_CLIENTS", err);
      setClients(INITIAL_MOCK_CLIENTS);
      setSelectedClient(INITIAL_MOCK_CLIENTS[0]);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleUpdateClientNotes = (clientId, newNotes) => {
    setClients(prev => prev.map(c => 
      (c._id || c.id) === clientId ? { ...c, internalNotes: newNotes } : c
    ));
    if (selectedClient && (selectedClient._id || selectedClient.id) === clientId) {
      setSelectedClient(prev => ({ ...prev, internalNotes: newNotes }));
    }
  };

  const handleResolveQuery = (queryId) => {
    setQueriesList(prev => prev.map(q => 
      q.id === queryId ? { ...q, status: 'Resolved' } : q
    ));
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

  const handleAddApproval = (newApprovalDoc) => {
    setApprovalsList(prev => [newApprovalDoc, ...prev]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* Render selected CRM module section */}
      <div>
        {activeTab === 'overview' && (
          <CRMOverview 
            clients={clients}
            queriesList={queriesList}
            approvalsList={approvalsList}
          />
        )}

        {activeTab === 'leads' && (
          <CRMLeadManagement />
        )}

        {activeTab === 'clients' && (
          <div className="w-full">
            <CRMClientList 
              clients={clients}
              loading={clientsLoading}
              selectedClient={selectedClient}
              onSelectClient={setSelectedClient}
              onRefreshClients={fetchClientsList}
              onUpdateClientNotes={handleUpdateClientNotes}
            />
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
            onAddApproval={handleAddApproval}
          />
        )}
      </div>

    </div>
  );
}
