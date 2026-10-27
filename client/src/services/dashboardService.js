import api from './api';

export const dashboardService = {
  async getOrganizerDashboardStats() {
    const response = await api.get('/organizer/dashboard/stats');
    return response.data;
  },

  async getParticipantDashboardStats() {
    const response = await api.get('/participant/dashboard/stats');
    return response.data;
  }
};
