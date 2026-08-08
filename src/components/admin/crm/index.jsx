import React, { useState, useEffect } from 'react';
import CRMLeadManagement from './CRMLeadManagement';
import CRMClientList from './CRMClientList';
import CRMClientProfile from './CRMClientProfile';
import CRMQueries from './CRMQueries';
import CRMApprovals from './CRMApprovals';
import { getClients } from '../../../service/crm/client';

export default function CRM({ defaultTab = 'leads' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab === 'overview' ? 'leads' : defaultTab);
  }, [defaultTab]);

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [queriesList, setQueriesList] = useState([]);
  const [approvalsList, setApprovalsList] = useState([]);

  useEffect(() => {
    fetchClientsList();
  }, []);

  const fetchClientsList = async () => {
    setClientsLoading(true);
    try {
      const res = await getClients();
      if (res && (res.success || Array.isArray(res))) {
        const clientList = res.clients || res.data || (Array.isArray(res) ? res : []);
        setClients(clientList);
        if (clientList.length > 0) {
          setSelectedClient(prev => {
            if (!prev) return clientList[0];
            const updated = clientList.find(c => (c._id || c.id) === (prev._id || prev.id));
            return updated || clientList[0];
          });
        } else {
          setSelectedClient(null);
        }
      } else {
        setClients([]);
        setSelectedClient(null);
      }
    } catch (err) {
      console.warn("Failed to fetch client list from backend API:", err);
      setClients([]);
      setSelectedClient(null);
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
  };

  const handleReplyQuery = (queryId, replyText) => {
    const newReply = {
      author: "Admin Support",
      text: replyText,
      date: "Just now"
    };
    setQueriesList(prev => prev.map(q => 
      q.id === queryId ? { ...q, replies: [...(q.replies || []), newReply] } : q
    ));
  };

  const handleApproveRelease = (appId) => {
    setApprovalsList(prev => prev.map(app => 
      app.id === appId ? { ...app, status: 'Approved' } : app
    ));
  };

  const handleRejectRelease = (appId) => {
    setApprovalsList(prev => prev.map(app => 
      app.id === appId ? { ...app, status: 'Rejected' } : app
    ));
  };

  const handleAddApproval = (newApprovalDoc) => {
    setApprovalsList(prev => [newApprovalDoc, ...prev]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* Render selected CRM module section */}
      <div>
        {(activeTab === 'leads' || activeTab === 'overview') && (
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
