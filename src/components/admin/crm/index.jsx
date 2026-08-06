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

export default function CRM({ defaultTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [queriesList, setQueriesList] = useState(INITIAL_QUERIES);
  const [approvalsList, setApprovalsList] = useState(INITIAL_APPROVALS);

  useEffect(() => {
    fetchClientsList();
  }, []);

  const fetchClientsList = async () => {
    setClientsLoading(true);
    try {
      const res = await getClients();
      if (res?.success) {
        const clientList = res.clients || [];
        setClients(clientList);
        if (clientList.length > 0) {
          setSelectedClient(prev => {
            if (!prev) return clientList[0];
            const updated = clientList.find(c => (c._id || c.id) === (prev._id || prev.id));
            return updated || clientList[0];
          });
        }
      }
    } catch (err) {
      console.error("Failed to load clients list:", err);
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
