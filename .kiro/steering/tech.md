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
- **AI Integration**: @ai-sdk/openai with OpenRouter baseURL configuration
- **Tools & Workflows**: Mastra createTool and createWorkflow for structured operations
- **Protocol**: AG-UI Protocol for real-time agent communication
- **Runtime**: Node.js with ES modules
- **Communication**: Server-Sent Events (SSE) for streaming
- **Validation**: Zod schemas for type-safe tool inputs/outputs
- **Logging**: @mastra/loggers with PinoLogger for structured logging

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
  "zod": "^3.22.0"
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

## Code Style & Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with React hooks
- **Prettier**: Consistent code formatting
- **Material-UI**: Follow MUI design system guidelines
- **Redux**: Use RTK Query for API calls and caching