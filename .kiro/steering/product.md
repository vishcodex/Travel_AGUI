# Product Overview

This is a flight booking application that demonstrates the integration of AI agents with modern web interfaces using the AG-UI Protocol. The application allows users to search, compare, and book flight tickets through an intelligent conversational interface.

## Key Features
- **AI-Powered Flight Search**: Conversational interface with GPT-4o-mini agent
- **Complete AG-UI Protocol**: All 24 event types for comprehensive agent tracking
- **Progressive Workflow Visualization**: Real-time checklist showing agent progress
- **Tool Execution Transparency**: Full visibility into flight search tool calls
- **Intelligent Fallback Systems**: Manual tool execution when agent doesn't call tools
- **Modern React Frontend**: Material-UI with progressive indicators and animations
- **Enhanced Agent Backend**: Mastra-powered with optimized tool calling

## User Experience
- Users interact with an intelligent AI agent for flight search
- Progressive checklist shows exactly what the agent is doing in real-time
- Complete transparency into tool calls, thinking processes, and state changes
- Visual feedback with checkmarks, progress bars, and live status updates
- Fallback mechanisms ensure reliable tool execution even when agent doesn't call tools
- Event filtering allows users to see relevant information without noise

## Technical Architecture
- Frontend: React + TypeScript + Material-UI + Redux with comprehensive AG-UI event handling
- Backend: Mastra JavaScript agents with complete 24-event AG-UI Protocol implementation
- AI Provider: OpenRouter with GPT-4o-mini for enhanced tool calling capabilities
- Communication: Server-Sent Events with EventEncoder for proper AG-UI streaming
- Event System: Progressive workflow visualization with real-time status tracking