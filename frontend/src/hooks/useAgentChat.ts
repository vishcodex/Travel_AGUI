import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { 
  addMessage, 
  updateLastMessage, 
  setStreaming, 
  addLiveEvent, 
  updateLiveEvent, 
  clearLiveEvents 
} from '../store/slices/agentSlice';

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
      dispatch(clearLiveEvents());

      // Add user message if provided
      if (message) {
        dispatch(addMessage({
          role: 'user',
          content: message,
        }));
        dispatch(addLiveEvent({
          id: `user-input-${Date.now()}`,
          type: 'USER_INPUT',
          message: `📥 Received user input: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
        }));
      } else if (searchParams) {
        dispatch(addLiveEvent({
          id: `user-search-${Date.now()}`,
          type: 'USER_SEARCH',
          message: `🔍 Received flight search request: ${searchParams.origin} → ${searchParams.destination}`,
          details: `${searchParams.departureDate}, ${searchParams.passengers.adults} passenger(s), ${searchParams.class} class`
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

      console.log('🔄 Sending request to:', `${apiUrl}${endpoint}`);
      console.log('📦 Payload:', payload);

      // Use fetch with streaming response
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Response received, starting to read stream...');

      // Read the response as text and parse SSE events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      let assistantMessageStarted = false;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('📡 Stream ended');
          break;
        }

        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              console.log('📨 Received event:', eventData.type, eventData);
              
              // Add each real event as it happens
              const eventId = `${eventData.type}-${Date.now()}`;
              
              switch (eventData.type) {
                case 'RUN_STARTED':
                  console.log('🚀 Agent run started');
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'RUN_STARTED',
                    message: `🚀 Agent run started (Thread: ${eventData.threadId})`,
                    details: `Run ID: ${eventData.runId}`
                  }));
                  break;
                  
                case 'TEXT_MESSAGE_START':
                  console.log('💬 Message started');
                  assistantMessageStarted = true;
                  dispatch(addMessage({
                    role: 'assistant',
                    content: '',
                  }));
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'TEXT_MESSAGE_START',
                    message: `💬 Starting to compose response (Message ID: ${eventData.messageId})`,
                    details: `Role: ${eventData.role}`
                  }));
                  break;
                  
                case 'TEXT_MESSAGE_CONTENT':
                  if (assistantMessageStarted) {
                    console.log('📝 Adding text chunk:', eventData.delta);
                    dispatch(updateLastMessage(eventData.delta));
                    // Don't show individual character streaming events - too noisy
                    // The user wants to see high-level events only
                  }
                  break;
                  
                case 'TEXT_MESSAGE_END':
                  console.log('✅ Message completed');
                  assistantMessageStarted = false;
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'TEXT_MESSAGE_END',
                    message: `✅ Response completed (Message ID: ${eventData.messageId})`,
                  }));
                  break;
                  
                case 'TOOL_CALL_START':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'TOOL_CALL_START',
                    message: `🔧 Calling tool: ${eventData.toolCallName}`,
                    details: `Tool Call ID: ${eventData.toolCallId}${eventData.parentMessageId ? `, Parent: ${eventData.parentMessageId}` : ''}`
                  }));
                  break;
                  
                case 'TOOL_CALL_ARGS':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'TOOL_CALL_ARGS',
                    message: `📋 Tool arguments: ${eventData.delta}`,
                    details: `Tool Call ID: ${eventData.toolCallId}`
                  }));
                  break;
                  
                case 'TOOL_CALL_END':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'TOOL_CALL_END',
                    message: `✅ Tool execution completed`,
                    details: `Tool Call ID: ${eventData.toolCallId}`
                  }));
                  break;

                case 'THINKING_START':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'THINKING_START',
                    message: `🤔 Agent is thinking...`,
                    details: `Message ID: ${eventData.messageId}`
                  }));
                  break;

                case 'THINKING_TEXT_MESSAGE_CONTENT':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'THINKING_TEXT_MESSAGE_CONTENT',
                    message: `💭 Thinking: ${eventData.delta}`,
                    details: `Message ID: ${eventData.messageId}`
                  }));
                  break;

                case 'THINKING_END':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'THINKING_END',
                    message: `✅ Thinking completed`,
                    details: `Message ID: ${eventData.messageId}`
                  }));
                  break;

                case 'STEP_STARTED':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'STEP_STARTED',
                    message: `🚀 Step started: ${eventData.stepName}`,
                    details: `Step ID: ${eventData.stepId}`
                  }));
                  break;

                case 'STEP_FINISHED':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'STEP_FINISHED',
                    message: `✅ Step completed: ${eventData.stepName || 'Unknown'}`,
                    details: `Step ID: ${eventData.stepId}`
                  }));
                  break;

                case 'TOOL_CALL_RESULT':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'TOOL_CALL_RESULT',
                    message: `📊 Tool result received`,
                    details: `Tool Call ID: ${eventData.toolCallId}`
                  }));
                  break;

                case 'STATE_SNAPSHOT':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'STATE_SNAPSHOT',
                    message: `📸 State snapshot captured`,
                    details: `Current step: ${eventData.state?.currentStep || 'unknown'}`
                  }));
                  break;

                case 'STATE_DELTA':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'STATE_DELTA',
                    message: `🔄 State updated`,
                    details: JSON.stringify(eventData.delta).slice(0, 100)
                  }));
                  break;

                case 'MESSAGES_SNAPSHOT':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'MESSAGES_SNAPSHOT',
                    message: `💬 Messages snapshot: ${eventData.messages?.length || 0} messages`,
                    details: `Thread: ${eventData.threadId}`
                  }));
                  break;

                case 'RAW':
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'RAW',
                    message: `🔧 Raw event received`,
                    details: JSON.stringify(eventData).slice(0, 100)
                  }));
                  break;
                  
                case 'CUSTOM':
                  if (eventData.name === 'FLIGHT_SEARCH_RESULT') {
                    console.log('✈️ Flight search results:', eventData.value);
                    dispatch(addLiveEvent({
                      id: eventId,
                      type: 'CUSTOM',
                      message: `✈️ Flight search completed: Found ${eventData.value?.totalResults || 0} flights`,
                      details: eventData.value ? `Price range: $${Math.min(...(eventData.value.flights?.map((f: any) => f.price.amount) || [0]))} - $${Math.max(...(eventData.value.flights?.map((f: any) => f.price.amount) || [0]))}` : 'No details'
                    }));
                  } else {
                    dispatch(addLiveEvent({
                      id: eventId,
                      type: 'CUSTOM',
                      message: `🔔 Custom event: ${eventData.name}`,
                      details: typeof eventData.value === 'string' ? eventData.value : JSON.stringify(eventData.value).slice(0, 100)
                    }));
                  }
                  break;
                  
                case 'RUN_FINISHED':
                  console.log('🏁 Agent run finished');
                  dispatch(setStreaming(false));
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'RUN_FINISHED',
                    message: `🏁 Agent run completed successfully`,
                    details: `Thread: ${eventData.threadId}, Run: ${eventData.runId}`
                  }));
                  break;
                  
                case 'RUN_ERROR':
                  console.error('❌ Agent error:', eventData.message);
                  dispatch(addMessage({
                    role: 'assistant',
                    content: `Error: ${eventData.message}`,
                  }));
                  dispatch(setStreaming(false));
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: 'RUN_ERROR',
                    message: `❌ Error: ${eventData.message}`,
                    details: eventData.code ? `Error Code: ${eventData.code}` : 'No error code'
                  }));
                  break;
                  
                default:
                  // Catch any other events we might not be handling
                  dispatch(addLiveEvent({
                    id: eventId,
                    type: eventData.type,
                    message: `📡 Event: ${eventData.type}`,
                    details: JSON.stringify(eventData).slice(0, 100)
                  }));
                  break;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE event:', line, parseError);
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