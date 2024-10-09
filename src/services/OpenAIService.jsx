import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only use this for development. For production, use a backend proxy.
});

const openaiService = {
  generateResponse: async (messages, model = 'gpt-4o-mini') => {
    try {
      console.log(`Sending request to OpenAI API with messages using model: ${model}`);
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: "You are a helpful assistant in a flowchart node. Provide detailed and comprehensive responses." },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        max_tokens: 16384, // Increased to allow for longer responses
      });
      console.log('Received response from OpenAI API:', response);
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },
};

export default openaiService;