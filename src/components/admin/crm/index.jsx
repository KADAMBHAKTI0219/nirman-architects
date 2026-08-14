import React, { useState, useEffect } from 'react';
import CRMLeadManagement from './CRMLeadManagement';
import CRMClientList from './CRMClientList';
import CRMClientProfile from './CRMClientProfile';
import { getClients, getLinksByClient } from '../../../service/crm/client';
import { getProjects } from '../../../service/project';

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
      const [res, projRes] = await Promise.all([
        getClients().catch(() => null),
        getProjects().catch(() => null)
      ]);

      const allProjs = (projRes?.success && Array.isArray(projRes.projects)) ? projRes.projects : [];

      if (res && (res.success || Array.isArray(res))) {
        const rawList = res.clients || res.data || (Array.isArray(res) ? res : []);
        
        const enrichedList = await Promise.all(rawList.map(async (c) => {
          const cId = c._id || c.id;
          let links = [];
          try {
            const linkRes = await getLinksByClient(cId);
            if (linkRes?.success && Array.isArray(linkRes.links)) {
              links = linkRes.links;
            }
          } catch(e) {}

          const cEmail = (c.email || c.primaryContact?.email || '').toLowerCase().trim();
          const cPhone = String(c.phone || c.primaryContact?.phone || '').trim();
          const cName = (c.name || '').toLowerCase().trim();

          const matchedDirectProjects = allProjs.filter(p => {
            const pClient = (p.clientInformation || p.client || '').toLowerCase().trim();
            const pEmail = (p.clientEmail || '').toLowerCase().trim();
            const pPhone = String(p.clientPhone || '').trim();
            const pClientId = String(p.clientId || '');

            return (pClientId && pClientId === String(cId)) ||
                   (cName && pClient.includes(cName)) ||
                   (cEmail && pEmail && pEmail === cEmail) ||
                   (cPhone && pPhone && pPhone === cPhone);
          });

          const linkedProjList = [
            ...links.map(l => ({
              id: l.projectId?._id || l.projectId?.id || l.projectId,
              name: l.projectId?.name || l.projectName || 'Linked Project'
            })),
            ...matchedDirectProjects.map(p => ({
              id: p._id || p.id,
              name: p.projectName || p.name || 'Project'
            }))
          ];

          const seenMap = new Map();
          linkedProjList.forEach(p => {
            if (p.id && !seenMap.has(String(p.id))) {
              seenMap.set(String(p.id), p);
            }
          });
          const uniqueProjects = Array.from(seenMap.values());

          return {
            ...c,
            projects: uniqueProjects,
            activeProjectCount: uniqueProjects.length
          };
        }));

        setClients(enrichedList);
        if (enrichedList.length > 0) {
          setSelectedClient(prev => {
            if (!prev) return enrichedList[0];
            const updated = enrichedList.find(c => (c._id || c.id) === (prev._id || prev.id));
            return updated || enrichedList[0];
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
          <CRMLeadManagement 
            onClientCreated={async (newClient) => {
              await fetchClientsList();
              setSelectedClient(newClient);
              setActiveTab('clients');
            }}
          />
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

      </div>

    </div>
  );
}
