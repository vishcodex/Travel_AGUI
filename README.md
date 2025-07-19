# Flight Booking Assistant

A modern flight booking application powered by AI agents using the AG-UI Protocol. This application demonstrates real-time communication between a React frontend and Mastra-powered backend agents.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenRouter API key

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd ui_experiment/AG-UI-Mastra
   ```

2. **Install dependencies:**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your OPENROUTER_API_KEY
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Start the development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with Vite
- **UI**: Material-UI components
- **State**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **AG-UI**: Real-time agent communication

### Backend (Node.js + Mastra)
- **Agent Framework**: Mastra JavaScript with proper Agent class
- **AI Provider**: OpenRouter via @ai-sdk/openai integration
- **Tools**: Mastra createTool for structured flight search
- **Workflows**: Multi-step flight booking workflow with validation
- **Protocol**: AG-UI for streaming responses
- **API**: Express.js with CORS support

## 📁 Project Structure

```
AG-UI-Mastra/
├── frontend/           # React TypeScript application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route-level pages
│   │   ├── store/      # Redux store and slices
│   │   ├── theme/      # Material-UI theme
│   │   └── App.tsx     # Main application component
│   └── package.json
├── backend/            # Node.js backend with Mastra agents
│   ├── src/
│   │   ├── agents/     # Mastra Agent implementations
│   │   ├── workflows/  # Mastra Workflow definitions
│   │   ├── routes/     # Express route handlers
│   │   ├── services/   # Business logic services
│   │   ├── mastra.ts   # Mastra instance configuration
│   │   └── index.ts    # Server entry point
│   └── package.json
├── shared/             # Shared TypeScript types
│   └── types/          # Common interfaces and types
└── README.md
```

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm run type-check` - Check TypeScript types

### Environment Variables

**Backend (.env):**
```
OPENROUTER_API_KEY=your_openrouter_key_here
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="Flight Booking Assistant"
```

## 🤖 Mastra AI Features

### **Agents**
- **FlightBookingAgent**: Mastra Agent with OpenRouter LLM integration
- **Conversational Interface**: Natural language flight search and booking
- **Tool Integration**: Structured flight search with Zod schemas

### **Tools**
- **FlightSearchTool**: createTool with input/output validation
- **Structured Parameters**: Origin, destination, dates, passengers, class
- **Mock Flight Service**: Realistic flight data generation

### **Workflows**
- **FlightBookingWorkflow**: Multi-step workflow with chained operations
- **Validation Step**: Input parameter validation and sanitization
- **Search Step**: Flight search execution with error handling
- **Formatting Step**: Results processing and presentation

### **Integration**
- **AG-UI Protocol**: Server-Sent Events streaming
- **Real-time Responses**: Live agent communication
- **Error Handling**: Comprehensive error management and logging

## 🎨 UI Features

- **Modern Design**: Material-UI components with custom theme
- **Responsive Layout**: Mobile-first responsive design
- **Real-time Updates**: Live agent responses and flight data
- **Intuitive Search**: Easy-to-use flight search interface

## 🧪 Testing & Development

### **Current Implementation**
- **Mock Flight Service**: Realistic flight data generation for development
- **Mastra Agent Testing**: Conversational flight search via chat interface
- **Workflow Testing**: Multi-step flight booking process validation
- **AG-UI Streaming**: Real-time event streaming and response handling

### **API Endpoints**
- `POST /api/agents/flight-search` - Structured flight search with AG-UI streaming
- `POST /api/agents/chat` - Conversational agent interaction
- `POST /api/agents/workflow` - Direct workflow execution
- `POST /api/flights/search` - REST API flight search

### **Testing the Mastra Implementation**
```bash
# Test agent conversation
curl -X POST http://localhost:3001/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{"threadId":"test","runId":"1","message":"Find flights from NYC to LAX"}'

# Test structured flight search
curl -X POST http://localhost:3001/api/agents/flight-search \
  -H "Content-Type: application/json" \
  -d '{"threadId":"test","runId":"2","searchParams":{"origin":"NYC","destination":"LAX","departureDate":"2025-02-01","passengers":{"adults":1,"children":0,"infants":0},"class":"economy","tripType":"one-way"}}'
```

## 📚 Documentation

- [AG-UI Protocol](https://ag-ui.com/docs)
- [Mastra Framework](https://mastra.ai/docs)
- [Material-UI](https://mui.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## 🚀 Deployment

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar static hosting

### Backend
- Build: `npm run build`
- Deploy to Railway, Render, or similar Node.js hosting

## 🤝 Contributing

1. Follow the established code style and patterns
2. Update the master document (.kiro/steering/master.md) with progress
3. Test changes thoroughly before committing
4. Use conventional commit messages

## 📄 License

This project is for demonstration purposes.