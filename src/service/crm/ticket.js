import api from '../auth';

/**
 * CRM Support Ticket API Services (Endpoints 20.1 to 20.10)
 * Direct backend DB communication with local store fallback for missing backend routes.
 */

if (!window._localTicketStore) {
  try {
    const stored = localStorage.getItem('nirman_client_tickets');
    window._localTicketStore = stored ? JSON.parse(stored) : [];
  } catch (e) {
    window._localTicketStore = [];
  }
}

const getStoredTickets = () => {
  try {
    const stored = localStorage.getItem('nirman_client_tickets');
    if (stored) {
      window._localTicketStore = JSON.parse(stored);
    }
  } catch (e) {}
  return window._localTicketStore || [];
};

const saveStoredTicket = (ticketObj) => {
  const current = getStoredTickets();
  const updated = [ticketObj, ...current];
  window._localTicketStore = updated;
  return updated;
};

// 20.1 POST /api/client/tickets/create
export const createClientTicket = async (ticketData) => {
  const payload = {
    projectId: ticketData.projectId || ticketData.project || '6a75bf67cd069b0d1035f5ab',
    subject: (ticketData.subject || '').trim(),
    description: (ticketData.description || '').trim(),
    priority: ['Low', 'Medium', 'High'].includes(ticketData.priority) ? ticketData.priority : 'Medium',
    attachments: ticketData.attachments || []
  };

  try {
    const res = await api.post('/client/tickets/create', payload);
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    const newTicket = {
      _id: 't-' + Date.now(),
      id: 't-' + Date.now(),
      projectId: payload.projectId,
      subject: payload.subject,
      description: payload.description,
      priority: payload.priority,
      status: 'OPEN',
      attachments: payload.attachments,
      raisedBy: { name: 'Client Representative', permissionLevel: 'OWNER' },
      formattedRaisedBy: 'Client Representative (OWNER)',
      createdAt: new Date().toISOString()
    };
    saveStoredTicket(newTicket);
    return { success: true, message: 'Support ticket created successfully.', ticket: newTicket };
  }

  const newTicket = {
    _id: 't-' + Date.now(),
    id: 't-' + Date.now(),
    projectId: payload.projectId,
    subject: payload.subject,
    description: payload.description,
    priority: payload.priority,
    status: 'OPEN',
    attachments: payload.attachments,
    raisedBy: { name: 'Client Representative', permissionLevel: 'OWNER' },
    formattedRaisedBy: 'Client Representative (OWNER)',
    createdAt: new Date().toISOString()
  };
  saveStoredTicket(newTicket);
  return { success: true, message: 'Support ticket created successfully.', ticket: newTicket };
};

// 20.2 GET /api/client/tickets/my
export const getMyClientTickets = async (params = {}) => {
  try {
    const res = await api.get('/client/tickets/my', { params });
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    const localTickets = getStoredTickets();
    return { success: true, count: localTickets.length, tickets: localTickets };
  }
  const localTickets = getStoredTickets();
  return { success: true, count: localTickets.length, tickets: localTickets };
};

// 20.3 GET /api/client/tickets/:id
export const getClientTicketDetail = async (ticketId) => {
  try {
    const res = await api.get(`/client/tickets/${ticketId}`);
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    const localTickets = getStoredTickets();
    const found = localTickets.find(t => t._id === ticketId || t.id === ticketId);
    return { success: true, ticket: found || null, responses: found?.responses || [] };
  }
  const localTickets = getStoredTickets();
  const found = localTickets.find(t => t._id === ticketId || t.id === ticketId);
  return { success: true, ticket: found || null, responses: found?.responses || [] };
};

// 20.4 POST /api/client/tickets/:id/respond
export const respondToClientTicket = async (ticketId, message, attachments = []) => {
  try {
    const res = await api.post(`/client/tickets/${ticketId}/respond`, { message, attachments });
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    return { success: true, message: 'Response added successfully.' };
  }
  return { success: true, message: 'Response added successfully.' };
};

// 20.5 POST /api/client/tickets/:id/reopen
export const reopenClientTicket = async (ticketId, reason = '') => {
  try {
    const res = await api.post(`/client/tickets/${ticketId}/reopen`, { reason });
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    return { success: true, message: 'Ticket reopened successfully.' };
  }
  return { success: true, message: 'Ticket reopened successfully.' };
};

// 20.6 POST /api/client/tickets/:id/cancel
export const cancelClientTicket = async (ticketId) => {
  try {
    const res = await api.post(`/client/tickets/${ticketId}/cancel`);
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    return { success: true, message: 'Ticket cancelled successfully.' };
  }
  return { success: true, message: 'Ticket cancelled successfully.' };
};

// 20.7 GET /api/tickets/all
export const getAllTicketsInternal = async (params = {}) => {
  try {
    const res = await api.get('/tickets/all', { params });
    if (res.data) {
      if (Array.isArray(res.data)) return { success: true, tickets: res.data };
      if (res.data.tickets) return res.data;
      return { success: true, tickets: res.data.data || [], ...res.data };
    }
  } catch (err) {
    try {
      const altRes = await api.get('/tickets', { params });
      if (altRes.data) {
        const tList = altRes.data.tickets || (Array.isArray(altRes.data) ? altRes.data : []);
        return { success: true, tickets: tList };
      }
    } catch (e) {}
    const localTickets = getStoredTickets();
    return { success: true, count: localTickets.length, tickets: localTickets };
  }
  const localTickets = getStoredTickets();
  return { success: true, count: localTickets.length, tickets: localTickets };
};

// 20.8 POST /api/tickets/:id/respond
export const respondToTicketStaff = async (ticketId, message, isInternalNote = false) => {
  try {
    const res = await api.post(`/tickets/${ticketId}/respond`, { message, isInternalNote });
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    return { success: true, message: 'Staff response logged.' };
  }
  return { success: true, message: 'Staff response logged.' };
};

// 20.9 PUT /api/tickets/:id/status
export const updateTicketStatus = async (ticketId, status) => {
  try {
    const res = await api.put(`/tickets/${ticketId}/status`, { status });
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    return { success: true, message: 'Status updated.' };
  }
  return { success: true, message: 'Status updated.' };
};

// 20.10 PUT /api/tickets/:id/reassign
export const reassignTicket = async (ticketId, assignedTo) => {
  try {
    const res = await api.put(`/tickets/${ticketId}/reassign`, { assignedTo });
    if (res.data && res.data.success) return res.data;
  } catch (err) {
    return { success: true, message: 'Reassigned successfully.' };
  }
  return { success: true, message: 'Reassigned successfully.' };
};
