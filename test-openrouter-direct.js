import dotenv from 'dotenv';

dotenv.config();

console.log('Testing OpenRouter with direct fetch...');
console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Set (length: ' + process.env.OPENROUTER_API_KEY.length + ')' : 'Missing');

const testOpenRouterDirect = async () => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Flight Booking Assistant'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, can you respond with "OpenRouter is working!" to confirm the connection?'
          }
        ],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Response:', data.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
};

await testOpenRouterDirect();