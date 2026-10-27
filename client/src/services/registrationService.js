import api from './api';

export const registrationService = {
  async registerForEvent(eventId) {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  async cancelRegistration(eventId) {
    const response = await api.delete(`/events/${eventId}/register`);
    return response.data;
  },

  async getMyRegistrations(params = {}) {
    const response = await api.get('/registrations/my', { params });
    return response.data;
  }
};
