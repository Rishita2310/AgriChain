import api from './api';


export const farmerOrderService = {
  getOrders: async () => {
    const response = await api.get(`/farmer/orders/`);
    return response.data;
  },
  
  getOrderDetails: async (id) => {
    const response = await api.get(`/farmer/orders/${id}`);
    return response.data;
  },
  
  updateOrderStatus: async (id, payload) => {
    // payload: { action: 'accept' | 'reject' | 'pack' | 'ship', reason?: string, tracking_number?: string }
    const response = await api.post(`/farmer/orders/${id}/action`, payload);
    return response.data;
  }
};
