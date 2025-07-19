import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage, updateLastMessage, setStreaming } from '../store/slices/agentSlice';

interface UseAgentChatOptions {
  apiUrl?: string;
}

interface ChatMessage {
  threadId: string;
  runId: string;
  message?: string;
  searchParams?: any;
}

export const useAgentChat = (options: UseAgentChatOptions = {}) => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const apiUrl = options.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const sendMessage = useCallback(async (chatMessage: ChatMessage) => {
    const { threadId, runId, message, searchParams } = chatMessage;
    
    try {
      setIsConnected(true);
      dispatch(setStreaming(true));

      // Add user message if provided
      if (message) {
        dispatch(addMessage({
          role: 'user',
          content: message,
        }));
      }

      // Determine endpoint and payload
      const endpoint = searchParams ? '/api/agents/flight-search' : '/api/agents/chat';
      const payload = {
        threadId,
        runId,
        ...(message && { message }),
        ...(searchParams && { searchParams }),
      };

      // Create EventSource for Server-Sent Events
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Read the response as text and parse SSE events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      let assistantMessageStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              
              switch (eventData.type) {
                case 'RUN_STARTED':
                  console.log('🚀 Agent run started');
                  break;
                  
                case 'TEXT_MESSAGE_START':
                  console.log('💬 Message started');
                  assistantMessageStarted = true;
                  dispatch(addMessage({
                    role: 'assistant',
                    content: '',
                  }));
                  break;
                  
                case 'TEXT_MESSAGE_CONTENT':
                  if (assistantMessageStarted) {
                    dispatch(updateLastMessage(eventData.delta));
                  }
                  break;
                  
                case 'TEXT_MESSAGE_END':
                  console.log('✅ Message completed');
                  assistantMessageStarted = false;
                  break;
                  
                case 'CUSTOM':
                  if (eventData.name === 'FLIGHT_SEARCH_RESULT') {
                    console.log('✈️ Flight search results:', eventData.value);
                    // You can dispatch this to a flight results slice if needed
                  }
                  break;
                  
                case 'RUN_FINISHED':
                  console.log('🏁 Agent run finished');
                  dispatch(setStreaming(false));
                  break;
                  
                case 'RUN_ERROR':
                  console.error('❌ Agent error:', eventData.message);
                  dispatch(addMessage({
                    role: 'assistant',
                    content: `Error: ${eventData.message}`,
                  }));
                  dispatch(setStreaming(false));
                  break;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE event:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      dispatch(addMessage({
        role: 'assistant',
        content: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      dispatch(setStreaming(false));
    } finally {
      setIsConnected(false);
    }
  }, [apiUrl, dispatch]);

  return {
    sendMessage,
    isConnected,
  };
};