import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Simple SSE test endpoint
app.post('/test-sse', (req, res) => {
  console.log('📡 SSE test endpoint called');
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send events with delays to test streaming
  let counter = 0;
  const words = ['Hello', ' there!', ' This', ' is', ' a', ' streaming', ' test.', ' Each', ' word', ' should', ' appear', ' separately.'];
  
  const sendWord = () => {
    if (counter < words.length) {
      const event = {
        type: counter === 0 ? 'TEXT_MESSAGE_START' : 'TEXT_MESSAGE_CONTENT',
        messageId: '123',
        delta: words[counter],
        ...(counter === 0 && { role: 'assistant' })
      };
      
      console.log(`📤 Sending: ${words[counter]}`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      
      counter++;
      setTimeout(sendWord, 500); // 500ms delay between words
    } else {
      // Send end event
      res.write(`data: ${JSON.stringify({ type: 'TEXT_MESSAGE_END', messageId: '123' })}\n\n`);
      res.end();
      console.log('✅ SSE test completed');
    }
  };
  
  // Start sending words
  setTimeout(sendWord, 100);
});

app.listen(3002, () => {
  console.log('🧪 SSE Test server running on http://localhost:3002');
  console.log('Test with: curl -X POST http://localhost:3002/test-sse');
});