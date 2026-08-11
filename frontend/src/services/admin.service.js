import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get(`/admin/stats`);
    return response.data;
  },
  getUsers: async (role = '') => {
    const url = role ? `/admin/users?role=${role}` : `/admin/users`;
    const response = await api.get(url);
    return response.data;
  },
  getSmartContracts: async () => {
    const response = await api.get(`/admin/contracts`);
    return response.data;
  },
  getProducts: async () => {
    const response = await api.get(`/admin/products`);
    return response.data;
  },
  getOrders: async (status = '') => {
    const url = status && status !== 'All' ? `/admin/orders?status=${status}` : `/admin/orders`;
    const response = await api.get(url);
    return response.data;
  }
};
