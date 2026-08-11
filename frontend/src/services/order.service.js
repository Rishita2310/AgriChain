import api from './api';


export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post(`/orders/`, orderData);
    return response.data;
  }
};
