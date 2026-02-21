import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const openRouterService = {
  async chat(messages: { role: string; content: string }[]) {
    try {
      const response = await axios.post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          model: 'openai/gpt-3.5-turbo',
          messages
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://commercialai.vercel.app',
            'X-Title': 'CommercialAI'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw error;
    }
  }
};
