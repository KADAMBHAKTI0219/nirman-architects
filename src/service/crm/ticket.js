import api from '../auth';

/**
 * CRM Support Ticket API Services (Endpoints 20.1 to 20.10)
 * Direct backend DB communication.
 */

export const createClientTicket = async (ticketData) => {
  const res = await api.post('/client/tickets/create', ticketData);
  return res.data;
};

export const getMyClientTickets = async (params = {}) => {
  try {
    const res = await api.get('/client/tickets/my', { params });
    return res.data;
  } catch (err) {
    return { success: false, tickets: [], message: err.response?.data?.message || err.message };
  }
};

export const getClientTicketDetail = async (ticketId) => {
  const res = await api.get(`/client/tickets/${ticketId}`);
  return res.data;
};

export const respondToClientTicket = async (ticketId, message, attachments = []) => {
  const res = await api.post(`/client/tickets/${ticketId}/respond`, { message, attachments });
  return res.data;
};

export const reopenClientTicket = async (ticketId, reason = '') => {
  const res = await api.post(`/client/tickets/${ticketId}/reopen`, { reason });
  return res.data;
};

export const cancelClientTicket = async (ticketId) => {
  const res = await api.post(`/client/tickets/${ticketId}/cancel`);
  return res.data;
};

export const getAllTicketsInternal = async (params = {}) => {
  try {
    const res = await api.get('/tickets', { params });
    if (res.data) {
      if (Array.isArray(res.data)) return { success: true, tickets: res.data };
      if (res.data.tickets) return res.data;
      return { success: true, tickets: res.data.data || [], ...res.data };
    }
    return { success: true, tickets: [] };
  } catch (err) {
    return { success: false, tickets: [], message: err.response?.data?.message || err.message };
  }
};

export const respondToTicketStaff = async (ticketId, message, isInternalNote = false) => {
  const res = await api.post(`/tickets/${ticketId}/respond`, { message, isInternalNote });
  return res.data;
};

export const updateTicketStatus = async (ticketId, status) => {
  const res = await api.put(`/tickets/${ticketId}/status`, { status });
  return res.data;
};

export const reassignTicket = async (ticketId, assignedTo) => {
  const res = await api.put(`/tickets/${ticketId}/reassign`, { assignedTo });
  return res.data;
};
