import api from './api';

export const kisanAIService = {
  // Get all conversations for the user
  getConversations: async () => {
    const response = await api.get(`/kisan-ai/conversations`);
    return response.data;
  },

  // Get full history for a specific conversation
  getConversationHistory: async (id) => {
    const response = await api.get(`/kisan-ai/conversations/${id}`);
    return response.data;
  },

  // Send a message and get response
  sendMessage: async (message, conversationId = null) => {
    const response = await api.post(`/kisan-ai/chat`, {
      message,
      conversation_id: conversationId
    });
    return response.data;
  },

  // Rename a conversation
  renameConversation: async (id, title) => {
    const response = await api.patch(`/kisan-ai/conversations/${id}`, { title });
    return response.data;
  },

  // Delete a conversation
  deleteConversation: async (id) => {
    const response = await api.delete(`/kisan-ai/conversations/${id}`);
    return response.data;
  }
};
