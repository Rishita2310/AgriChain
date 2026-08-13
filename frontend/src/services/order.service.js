import api from './api';

export const orderService = {
  createPaymentIntent: async (orderData) => {
    const response = await api.post(`/orders/payment-intent`, orderData);
    return response.data;
  },

  verifyPayment: async (verificationData) => {
    const response = await api.post(`/orders/verify-payment`, verificationData);
    return response.data;
  },

  confirmDelivery: async (id, transaction_hash) => {
    const response = await api.post(`/buyer/orders/${id}/confirm-delivery`, { transaction_hash });
    return response.data;
  },

  // Legacy for non-web3 if needed
  createOrder: async (orderData) => {
    const response = await api.post(`/orders/`, orderData);
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  getOrderInvoice: async (id) => {
    const response = await api.get(`/orders/${id}/invoice`);
    return response.data;
  },

  cancelOrder: async (id, reason = '') => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  }
};
