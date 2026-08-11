import api from './api';


export const profileService = {
  getCompletion: async () => {
    const response = await api.get(`/farmer/profile/completion`);
    return response.data;
  },

  updatePersonal: async (data) => {
    const response = await api.put(`/farmer/profile/personal`, data);
    return response.data;
  },

  updateFarm: async (data) => {
    const response = await api.put(`/farmer/profile/farm`, data);
    return response.data;
  },

  updateDocuments: async (data) => {
    const response = await api.put(`/farmer/profile/documents`, data);
    return response.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/farmer/profile/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data; // { url: '/uploads/...' }
  },

  submit: async () => {
    const response = await api.post(`/farmer/profile/submit`, {});
    return response.data;
  }
};
