import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlightBookingAgentState } from '@shared/types/agent';

interface AgentState extends FlightBookingAgentState {
  connected: boolean;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
  isStreaming: boolean;
}

const initialState: AgentState = {
  connected: false,
  currentStep: 'search',
  messages: [],
  isStreaming: false,
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
} = agentSlice.actions;

export default agentSlice.reducer;