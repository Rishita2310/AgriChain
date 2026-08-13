import api from './api';


export const buyerOrderService = {
  getOrders: async () => {
    const response = await api.get(`/buyer/orders`);
    return response.data;
  },
  
  getOrderDetails: async (id) => {
    const response = await api.get(`/buyer/orders/${id}`);
    return response.data;
  },
  
  submitReview: async (id, payload) => {
    // payload: { rating: number, comment: string }
    const response = await api.post(`/buyer/orders/${id}/review`, payload);
    return response.data;
  },

  confirmDelivery: async (id, transaction_hash) => {
    const response = await api.post(`/buyer/orders/${id}/confirm-delivery`, { transaction_hash });
    return response.data;
  }
};
