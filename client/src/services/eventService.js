import api from './api';

export const eventService = {
  async getEvents(params = {}) {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getEventById(id) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async createEvent(eventData) {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  async updateEvent(id, eventData) {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  async cancelEvent(id) {
    const response = await api.patch(`/events/${id}/cancel`);
    return response.data;
  },

  async getOrganizerEvents(params = {}) {
    const response = await api.get('/organizer/events', { params });
    return response.data;
  },

  async getEventParticipants(id, params = {}) {
    const response = await api.get(`/organizer/events/${id}/participants`, { params });
    return response.data;
  }
};
