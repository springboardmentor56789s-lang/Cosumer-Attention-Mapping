import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const sendCopilotMessage = async ({
  message,
  storeId = 101,
  videoId = 1,
  conversationId = 'default_session',
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/copilot/chat`, {
      message,
      store_id: storeId,
      video_id: videoId,
      conversation_id: conversationId,
    });
    return response.data;
  } catch (error) {
    console.error('Error communicating with Copilot API:', error);
    return {
      answer: 'Failed to connect to AI Copilot service. Please check your backend connection.',
      type: 'error',
      confidence: 0.0,
      data: {},
      evidence: ['API request failed or backend server unreachable.'],
      conversation_id: conversationId,
    };
  }
};
