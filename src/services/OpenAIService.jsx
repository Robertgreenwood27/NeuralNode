import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only use this for development. For production, use a backend proxy.
});

const openaiService = {
  generateResponse: async (messages) => {
    try {
      console.log('Sending request to OpenAI API with messages:', messages);
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant in a flowchart node. Provide concise responses." },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
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