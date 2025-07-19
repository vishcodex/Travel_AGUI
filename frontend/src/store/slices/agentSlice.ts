import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlightBookingAgentState } from '@shared/types/agent';

interface LiveEvent {
  id: string;
  type: string;
  message: string;
  status: 'active' | 'completed' | 'error';
  timestamp: number;
  details?: any;
  progress?: number; // 0-100 for progress bars
}

interface AgentState extends FlightBookingAgentState {
  connected: boolean;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
  isStreaming: boolean;
  liveEvents: LiveEvent[];
}

const initialState: AgentState = {
  connected: false,
  currentStep: 'search',
  messages: [],
  isStreaming: false,
  liveEvents: [],
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<FlightBookingAgentState['currentStep']>) => {
      state.currentStep = action.payload;
    },
    addMessage: (state, action: PayloadAction<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>) => {
      state.messages.push({
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
      });
    },
    updateLastMessage: (state, action: PayloadAction<string>) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content += action.payload;
      }
    },
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    setAgentState: (state, action: PayloadAction<Partial<FlightBookingAgentState>>) => {
      Object.assign(state, action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addLiveEvent: (state, action: PayloadAction<{
      id: string;
      type: string;
      message: string;
      details?: any;
      progress?: number;
    }>) => {
      // Check if event with this ID already exists, update it instead of adding duplicate
      const existingEvent = state.liveEvents.find(e => e.id === action.payload.id);
      if (existingEvent) {
        existingEvent.message = action.payload.message;
        existingEvent.details = action.payload.details;
        existingEvent.progress = action.payload.progress;
        existingEvent.timestamp = Date.now();
      } else {
        const event: LiveEvent = {
          id: action.payload.id,
          type: action.payload.type,
          message: action.payload.message,
          status: 'active',
          timestamp: Date.now(),
          details: action.payload.details,
          progress: action.payload.progress,
        };
        state.liveEvents.push(event);
      }
    },
    updateLiveEvent: (state, action: PayloadAction<{
      id: string;
      status?: 'active' | 'completed' | 'error';
      message?: string;
      progress?: number;
    }>) => {
      const event = state.liveEvents.find(e => e.id === action.payload.id);
      if (event) {
        if (action.payload.status) event.status = action.payload.status;
        if (action.payload.message) event.message = action.payload.message;
        if (action.payload.progress !== undefined) event.progress = action.payload.progress;
        event.timestamp = Date.now();
      }
    },
    clearLiveEvents: (state) => {
      state.liveEvents = [];
    },
  },
});

export const {
  setConnected,
  setCurrentStep,
  addMessage,
  updateLastMessage,
  setStreaming,
  setAgentState,
  clearMessages,
  addLiveEvent,
  updateLiveEvent,
  clearLiveEvents,
} = agentSlice.actions;

export default agentSlice.reducer;