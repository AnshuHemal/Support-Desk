import api from './api';

export const ticketService = {
  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },
  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },
  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data;
  },
  assignTicket: async (id, assignedTo) => {
    const response = await api.patch(`/tickets/${id}/assign`, { assignedTo });
    return response.data;
  },
  changeStatus: async (id, statusId) => {
    const response = await api.patch(`/tickets/${id}/status`, { statusId });
    return response.data;
  },
  addReply: async (id, message, isInternal = false) => {
    const response = await api.post(`/tickets/${id}/replies`, { message, isInternal });
    return response.data;
  },
  getTicketHistory: async (id) => {
    const response = await api.get(`/tickets/${id}/history`);
    return response.data;
  },
  mergeTickets: async (id, targetTicketId) => {
    const response = await api.post(`/tickets/${id}/merge`, { targetTicketId });
    return response.data;
  },
  addDependency: async (id, dependentTicketId, type) => {
    const response = await api.post(`/tickets/${id}/dependencies`, { dependentTicketId, type });
    return response.data;
  },
  removeDependency: async (id, dependentTicketId) => {
    const response = await api.delete(`/tickets/${id}/dependencies`, { data: { dependentTicketId } });
    return response.data;
  },
};
