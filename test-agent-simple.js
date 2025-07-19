import { createOpenAI } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing simple agent with working OpenRouter config...');

// Create OpenRouter client using the working method
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Create a simple test agent
const testAgent = new Agent({
  name: 'testAgent',
  instructions: 'You are a helpful assistant. Always respond with enthusiasm!',
  model: openrouter('openai/gpt-3.5-turbo'),
});

const runTest = async () => {
  try {
    console.log('1. Testing direct generateText...');
    const directResult = await generateText({
      model: openrouter('openai/gpt-3.5-turbo'),
      prompt: 'Say hello and confirm you are working!',
    });
    console.log('✅ Direct generateText works:', directResult.text);

    console.log('\n2. Testing Mastra Agent...');
    const agentResult = await testAgent.generate([
      { role: 'user', content: 'Hello! Can you confirm you are working?' }
    ]);
    console.log('✅ Mastra Agent works:', agentResult.text);

    console.log('\n3. Testing Agent streaming...');
    const stream = await testAgent.stream([
      { role: 'user', content: 'Stream a response: Hello from streaming test!' }
    ]);

    let streamedText = '';
    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
      streamedText += chunk;
    }
    console.log('\n✅ Streaming works! Full response:', streamedText);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
};

await runTest();