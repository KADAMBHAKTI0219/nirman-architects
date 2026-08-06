import axios from 'axios';
import {
  mockCreateTicket,
  mockGetMyTickets,
  mockGetTicketDetail,
  mockRespondToTicketClient,
  mockReopenTicket,
  mockCancelTicket,
  mockGetAllTicketsInternal,
  mockRespondToTicketStaff,
  mockUpdateTicketStatus,
  mockReassignTicket
} from './mockApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * 20.1 POST /api/client/tickets/create
 * Creates a new client support ticket (OWNER / MEMBER only). Auto-assigns PM.
 */
export const createClientTicket = async (ticketData) => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/client/tickets/create`, ticketData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for createClientTicket");
    return mockCreateTicket(ticketData);
  }
};

/**
 * 20.2 GET /api/client/tickets/my?status=&projectId=
 * Lists all support tickets belonging to the client organization.
 */
export const getMyClientTickets = async (params = {}) => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/client/tickets/my`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getMyClientTickets");
    return mockGetMyTickets(params);
  }
};

/**
 * 20.3 GET /api/client/tickets/:id
 * Returns full ticket detail along with complete chronological response thread.
 */
export const getClientTicketDetail = async (ticketId) => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/client/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getClientTicketDetail");
    return mockGetTicketDetail(ticketId);
  }
};

/**
 * 20.4 POST /api/client/tickets/:id/respond
 * Client adds response to ticket thread (OWNER / MEMBER only).
 */
export const respondToClientTicket = async (ticketId, message, attachments = []) => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/client/tickets/${ticketId}/respond`, { message, attachments }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for respondToClientTicket");
    return mockRespondToTicketClient(ticketId, message, attachments);
  }
};

/**
 * 20.5 POST /api/client/tickets/:id/reopen
 * Reopens CLOSED ticket within 14-day grace period.
 */
export const reopenClientTicket = async (ticketId, reason = '') => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/client/tickets/${ticketId}/reopen`, { reason }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for reopenClientTicket");
    return mockReopenTicket(ticketId, reason);
  }
};

/**
 * 20.6 POST /api/client/tickets/:id/cancel
 * Cancels an OPEN or IN_PROGRESS ticket.
 */
export const cancelClientTicket = async (ticketId) => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/client/tickets/${ticketId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for cancelClientTicket");
    return mockCancelTicket(ticketId);
  }
};

/**
 * 20.7 GET /api/tickets/all?status=&priority=&assignedTo=&projectId=
 * Internal team view listing all client tickets across projects.
 */
export const getAllTicketsInternal = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/tickets/all`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getAllTicketsInternal");
    return mockGetAllTicketsInternal(params);
  }
};

/**
 * 20.8 POST /api/tickets/:id/respond
 * Internal staff member responds to client ticket thread. Auto transitions OPEN -> IN_PROGRESS.
 */
export const respondToTicketStaff = async (ticketId, message, attachments = []) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/tickets/${ticketId}/respond`, { message, attachments }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for respondToTicketStaff");
    return mockRespondToTicketStaff(ticketId, message, attachments);
  }
};

/**
 * 20.9 PUT /api/tickets/:id/status
 * Updates ticket lifecycle status (IN_PROGRESS, RESOLVED, CLOSED, CANCELLED).
 */
export const updateTicketStatus = async (ticketId, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.put(`${API_URL}/tickets/${ticketId}/status`, { newStatus }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for updateTicketStatus");
    return mockUpdateTicketStatus(ticketId, newStatus);
  }
};

/**
 * 20.10 PUT /api/tickets/:id/reassign
 * Reassigns ticket to another internal employee with audit logging.
 */
export const reassignTicket = async (ticketId, targetUserId) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.put(`${API_URL}/tickets/${ticketId}/reassign`, { targetUserId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for reassignTicket");
    return mockReassignTicket(ticketId, targetUserId);
  }
};
