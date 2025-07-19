import { mastra } from './src/mastra.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Mastra Agent directly...');

const testAgent = async () => {
  try {
    console.log('1. Getting agent from Mastra instance...');
    const agent = mastra.getAgent('flightBookingAgent');
    
    if (!agent) {
      console.error('❌ Agent not found!');
      return;
    }
    
    console.log('✅ Agent found:', agent.name);
    
    console.log('2. Testing agent.generate()...');
    const result = await agent.generate([
      { role: 'user', content: 'Hello, can you help me find flights?' }
    ]);
    
    console.log('✅ Agent response:', result.text);
    
    console.log('3. Testing agent.stream()...');
    const stream = await agent.stream([
      { role: 'user', content: 'I need flights from NYC to LAX' }
    ]);
    
    console.log('✅ Stream created, reading chunks...');
    let fullResponse = '';
    
    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
      fullResponse += chunk;
    }
    
    console.log('\n✅ Full streamed response:', fullResponse);
    
  } catch (error) {
    console.error('❌ Error testing agent:', error.message);
    console.error('Stack:', error.stack);
  }
};

await testAgent();