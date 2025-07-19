# Technology Stack

## Frontend Stack
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) for components and theming
- **State Management**: Redux Toolkit for application state
- **Routing**: React Router for navigation
- **Build Tool**: Vite for fast development and optimized builds
- **Package Manager**: npm/yarn/pnpm

## Backend Stack
- **Agent Framework**: Mastra JavaScript with proper Agent class implementation
- **AI Integration**: @ai-sdk/openai with OpenRouter baseURL configuration (GPT-4o-mini)
- **Tools & Workflows**: Mastra createTool and createWorkflow for structured operations
- **Protocol**: Complete AG-UI Protocol implementation (24 event types)
- **Runtime**: Node.js with ES modules
- **Communication**: Server-Sent Events (SSE) for streaming with EventEncoder
- **Validation**: Zod schemas for type-safe tool inputs/outputs
- **Logging**: @mastra/loggers with PinoLogger for structured logging
- **Event Streaming**: Comprehensive AG-UI event emission with fallback mechanisms

## Key Libraries & Dependencies

### Frontend
```json
{
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "@reduxjs/toolkit": "^1.x",
  "react-redux": "^8.x",
  "react-router-dom": "^6.x",
  "@ag-ui/client": "latest",
  "@ag-ui/core": "latest"
}
```

### Backend
```json
{
  "@mastra/core": "latest",
  "@mastra/loggers": "latest",
  "@ai-sdk/openai": "^0.0.66",
  "@ag-ui/core": "latest",
  "@ag-ui/encoder": "latest",
  "express": "^4.x",
  "cors": "^2.x",
  "dotenv": "^16.3.0",
  "zod": "^3.22.0",
  "uuid": "^9.0.0"
}
```

## Development Commands

### Frontend (React App)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Backend (Mastra Agents)
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Run tests
npm test
```

### Mastra-Specific Commands
```bash
# Test Mastra agent directly
node -e "import('./src/mastra.js').then(m => console.log(m.mastra.getAgent('flightBookingAgent')))"

# Test workflow execution
curl -X POST http://localhost:3001/api/agents/workflow \
  -H "Content-Type: application/json" \
  -d '{"threadId":"test","runId":"1","workflowId":"flightBookingWorkflow","inputData":{"origin":"NYC","destination":"LAX","departureDate":"2025-02-01","passengers":{"adults":1,"children":0,"infants":0},"class":"economy","tripType":"one-way"}}'
```

## Environment Configuration
- **Frontend**: `.env` for API endpoints and feature flags
- **Backend**: `.env` for OpenRouter API keys and Mastra configuration
- **Development**: Hot reload for both frontend and backend
- **Production**: Optimized builds with proper error handling

## AG-UI Protocol Implementation - COMPLETE REFERENCE

### Event Types Supported (24 Total) - ALL IMPLEMENTED ✅
```typescript
// Core Lifecycle Events
RUN_STARTED, RUN_FINISHED, RUN_ERROR          // ✅ Agent execution lifecycle
STEP_STARTED, STEP_FINISHED                   // ✅ Workflow step tracking

// Message Streaming Events  
TEXT_MESSAGE_START, TEXT_MESSAGE_CONTENT, TEXT_MESSAGE_END, TEXT_MESSAGE_CHUNK
                                              // ✅ Response streaming with chunks

// Thinking/Reasoning Events
THINKING_START, THINKING_END, THINKING_TEXT_MESSAGE_CONTENT
                                              // ✅ Agent reasoning phases

// Tool Execution Events - FULLY IMPLEMENTED
TOOL_CALL_START, TOOL_CALL_ARGS, TOOL_CALL_END
TOOL_CALL_RESULT, TOOL_CALL_CHUNK            // ✅ Complete tool lifecycle

// State Management Events
STATE_SNAPSHOT, STATE_DELTA, MESSAGES_SNAPSHOT // ✅ Application state tracking

// Utility Events
CUSTOM, RAW                                   // ✅ Custom events and debugging
```

### Multiple Tool Integration (4 Tools) - PRODUCTION READY ✅
```typescript
// Tool 1: Live Flight Search (Real-time Data)
search-live-flights: OpenSky Network API (FREE)
- Real aircraft positions, altitudes, speeds
- Live flight callsigns and tracking data
- Completely free, no API key required

// Tool 2: Weather Flight Search (Mixed Data)  
search-flights-weather: Open-Meteo Weather API (FREE)
- Real weather conditions and temperatures
- Delay risk predictions based on weather
- Flight impact analysis

// Tool 3: Historical Flight Search (Mock Data)
search-flights-historical: Simulated Historical Data
- On-time performance metrics
- Price history and trends
- Reliability scores and analytics

// Tool 4: Enhanced Mock Search (Fallback)
search-flights-enhanced: Realistic Mock Data
- Detailed airline information
- Aircraft types and amenities
- Gate assignments and terminals
```

### Backend Event Emission - PRODUCTION IMPLEMENTATION
```typescript
// Proper event structure with EventEncoder
res.write(encoder.encode({
  type: EventType.TOOL_CALL_START,
  toolCallId,
  toolCallName: toolCall.toolName,
  parentMessageId: messageId,
}));

// Multiple tool execution with fallback
if (response.toolCalls && response.toolCalls.length > 0) {
  // Agent called tools naturally
  for (const toolCall of response.toolCalls) {
    await emitToolEvents(toolCall);
  }
} else if (searchParams) {
  // Fallback: Manual tool execution
  const searchResults = await searchFlightsOpenSky(searchParams);
  await emitManualToolEvents(searchResults);
}
```

### Frontend Event Handling - COMPLETE IMPLEMENTATION
```typescript
// Comprehensive event processing in useAgentChat (24 event types)
case 'TOOL_CALL_START':
  dispatch(addLiveEvent({
    id: eventId,
    type: 'TOOL_CALL_START', 
    message: `🔧 Calling tool: ${eventData.toolCallName}`,
    details: `Tool Call ID: ${eventData.toolCallId}`
  }));

// Progressive checklist with real-time updates
const workflowSteps = [
  { type: 'USER_INPUT', label: 'Received user request' },
  { type: 'RUN_STARTED', label: 'Agent run started' },
  { type: 'THINKING_START', label: 'Agent analyzing request' },
  { type: 'TOOL_CALL_START', label: 'Calling flight search tool' },
  { type: 'TOOL_CALL_ARGS', label: 'Processing search arguments' },
  { type: 'TOOL_CALL_RESULT', label: 'Tool result received' },
  { type: 'TOOL_CALL_END', label: 'Tool execution completed' },
  { type: 'CUSTOM', label: 'Flight search results found' },
  { type: 'RUN_FINISHED', label: 'Agent run completed' }
];
```

### Testing Suite - COMPREHENSIVE VALIDATION
```typescript
// Direct tool testing endpoints
POST /api/test/live-flights      // Test OpenSky real-time data
POST /api/test/weather-flights   // Test weather integration  
POST /api/test/historical-flights // Test historical data
POST /api/test/enhanced-flights  // Test enhanced mock data
POST /api/test/all-tools         // Test all tools simultaneously

// Command line testing
node test-tools.js               // Automated testing script
```

## Code Style & Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with React hooks
- **Prettier**: Consistent code formatting
- **Material-UI**: Follow MUI design system guidelines
- **Redux**: Use RTK Query for API calls and caching
- **AG-UI Events**: Consistent event naming and data structures