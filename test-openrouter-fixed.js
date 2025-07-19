import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing OpenRouter connection...');
console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Set (length: ' + process.env.OPENROUTER_API_KEY.length + ')' : 'Missing');

const model = openai('gpt-3.5-turbo', {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

try {
  console.log('Attempting to generate text...');
  
  const { text } = await generateText({
    model: model,
    prompt: 'Hello, can you respond with "OpenRouter is working!" to confirm the connection?',
  });
  
  console.log('✅ Success! Response:', text);
} catch (error) {
  console.error('❌ Error:', error.message);
  
  if (error.cause) {
    console.error('Cause:', error.cause);
  }
  
  // Check for specific OpenRouter errors
  if (error.message.includes('401')) {
    console.error('🔑 This looks like an authentication error. Check your API key.');
  } else if (error.message.includes('402')) {
    console.error('💳 This looks like a billing error. Check your OpenRouter account credits.');
  } else if (error.message.includes('429')) {
    console.error('⏰ Rate limit exceeded. Wait a moment and try again.');
  }
}