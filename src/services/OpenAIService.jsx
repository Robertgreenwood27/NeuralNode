import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only use this for development. For production, use a backend proxy.
});

const openaiService = {
  generateResponse: async function* (messages, model = 'gpt-4o-mini') {
    try {
      console.log(`Sending request to OpenAI API with messages using model: ${model}`);
      const stream = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: "You are a helpful assistant in a flowchart node. Provide detailed and comprehensive responses." },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        stream: true,
      });

      for await (const part of stream) {
        yield part.choices[0]?.delta?.content || '';
      }
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