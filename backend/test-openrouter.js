import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';

dotenv.config();

const model = openai('gpt-3.5-turbo', {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

console.log('Testing OpenRouter connection...');
console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Missing');

try {
  const response = await model.doGenerate({
    inputFormat: 'messages',
    mode: { type: 'regular' },
    prompt: [{ role: 'user', content: 'Hello, can you respond with "OpenRouter is working!"?' }],
  });
  
  console.log('Success! Response:', response.text);
} catch (error) {
  console.error('Error:', error.message);
  if (error.cause) {
    console.error('Cause:', error.cause);
  }
}
