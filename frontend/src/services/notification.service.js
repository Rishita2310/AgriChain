import api from './api';


export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get(`/notifications/unread-count`);
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/read/${id}`, {});
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put(`/notifications/read-all`, {});
    return response.data;
  },
  clearAll: async () => {
    const response = await api.delete(`/notifications/clear`);
    return response.data;
  }
};
