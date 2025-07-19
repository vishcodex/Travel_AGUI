import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing AI SDK with OpenRouter configuration...');
console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Set (length: ' + process.env.OPENROUTER_API_KEY.length + ')' : 'Missing');

// Try different configuration approaches
const testConfigurations = [
  {
    name: 'Method 1: createOpenAI with baseURL',
    test: async () => {
      const openrouter = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      const { text } = await generateText({
        model: openrouter('openai/gpt-3.5-turbo'),
        prompt: 'Hello, respond with "Method 1 works!"',
      });
      
      return text;
    }
  },
  {
    name: 'Method 2: openai with configuration object',
    test: async () => {
      const { openai } = await import('@ai-sdk/openai');
      
      const model = openai('openai/gpt-3.5-turbo', {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      const { text } = await generateText({
        model: model,
        prompt: 'Hello, respond with "Method 2 works!"',
      });
      
      return text;
    }
  }
];

for (const config of testConfigurations) {
  try {
    console.log(`\n🧪 Testing ${config.name}...`);
    const result = await config.test();
    console.log(`✅ ${config.name} Success:`, result);
    break; // Stop at first working method
  } catch (error) {
    console.error(`❌ ${config.name} Failed:`, error.message);
  }
}