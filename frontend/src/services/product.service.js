import api, { BASE_URL } from './api';

export const getProductImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export const productService = {
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getFarmerProducts: async () => {
    const response = await api.get(`/products/farmer`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/products/${id}/status`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getRecommended: async () => {
    const response = await api.get(`/products/recommended`);
    return response.data;
  },

  getLatest: async () => {
    const response = await api.get(`/products/latest`);
    return response.data;
  },

  getOrganic: async () => {
    const response = await api.get(`/products/organic`);
    return response.data;
  },

  getPopular: async () => {
    const response = await api.get(`/products/popular`);
    return response.data;
  },

  searchAndFilter: async (params) => {
    const response = await api.get(`/products/search`, { params });
    return response.data;
  },

  getReviews: async (id) => {
    const response = await api.get(`/products/${id}/reviews`);
    return response.data;
  },

  getSimilar: async (id) => {
    const response = await api.get(`/products/similar/${id}`);
    return response.data;
  },

  getQRCodeData: async (id) => {
    const response = await api.get(`/products/${id}/qrcode`);
    return response.data;
  },

  getBlockchainVerification: async (id) => {
    const response = await api.get(`/blockchain/verify/${id}`);
    return response.data;
  },

  addToCart: async (data) => {
    const response = await api.post(`/buyer/cart`, data);
    return response.data;
  },

  addToWishlist: async (data) => {
    const response = await api.post(`/buyer/wishlist`, data);
    return response.data;
  },

  contactFarmer: async (data) => {
    const response = await api.post(`/buyer/contact-farmer`, data);
    return response.data;
  }
};
