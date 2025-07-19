---
inclusion: always
---

# AG-UI Protocol Integration Guide

**Purpose**: This document serves as a comprehensive guide for integrating AG-UI Protocol streaming events into other applications, based on the complete implementation in this flight booking app.

## 🎯 **What We Accomplished**

This flight booking application is now a **complete AG-UI Protocol reference implementation** with:

### ✅ **Complete Event Streaming (24 Event Types)**
- All AG-UI Protocol events implemented and tested
- Progressive workflow visualization with real-time checkmarks
- Event filtering and customizable display
- Proper event encoding with EventEncoder

### ✅ **Multiple Tool Integration Patterns**
- 4 different tools with varying data sources (real-time, weather, historical, mock)
- Agent tool selection based on user intent
- Fallback mechanisms when agents don't call tools
- Comprehensive error handling and graceful degradation

### ✅ **Production-Ready Architecture**
- Real-time API integration (OpenSky Network, Open-Meteo)
- Comprehensive testing suite with direct tool testing
- Event debugging and monitoring capabilities
- Scalable patterns for other applications

## 🚀 **Key Integration Patterns**

### **1. Event Streaming Architecture**

```typescript
// Backend: Event Emission Pattern
import { EventType } from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';

const encoder = new EventEncoder();

// Set up Server-Sent Events
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

// Emit events with proper structure
res.write(encoder.encode({
  type: EventType.TOOL_CALL_START,
  toolCallId: 'unique-id',
  toolCallName: 'your-tool-name',
  parentMessageId: 'message-id',
}));
```

```typescript
// Frontend: Event Handling Pattern
const [events, setEvents] = useState([]);

const handleSSEEvent = (eventData) => {
  switch (eventData.type) {
    case 'TOOL_CALL_START':
      setEvents(prev => [...prev, {
        id: Date.now(),
        type: 'TOOL_CALL_START',
        message: `🔧 Calling tool: ${eventData.toolCallName}`,
        timestamp: Date.now()
      }]);
      break;
    // Handle other event types...
  }
};
```

### **2. Progressive Workflow Visualization**

```typescript
// Define expected workflow steps
const workflowSteps = [
  { type: 'RUN_STARTED', label: 'Process started', icon: <PlayArrow /> },
  { type: 'TOOL_CALL_START', label: 'Calling external service', icon: <Build /> },
  { type: 'TOOL_CALL_END', label: 'Service call completed', icon: <CheckCircle /> },
  { type: 'RUN_FINISHED', label: 'Process completed', icon: <Stop /> },
];

// Track completion status
const completedEvents = new Set(events.map(event => event.type));
const isCompleted = (stepType) => completedEvents.has(stepType);
```

### **3. Multiple Tool Integration**

```typescript
// Tool Definition Pattern
export const yourTool = createTool({
  id: 'your-tool-id',
  description: 'Tool description for agent selection',
  inputSchema: z.object({
    param1: z.string().describe('Parameter description'),
    param2: z.number().optional().nullable(),
  }),
  outputSchema: z.object({
    result: z.any(),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    // Your tool logic here
    return { result: data, summary: 'Tool execution summary' };
  },
});

// Agent with Multiple Tools
export const yourAgent = new Agent({
  name: 'yourAgent',
  instructions: `Choose the most appropriate tool based on user needs:
    - tool-1: For real-time data
    - tool-2: For historical analysis
    - tool-3: For enhanced processing`,
  model: openrouter('openai/gpt-4o-mini'),
  tools: {
    'tool-1': tool1,
    'tool-2': tool2,
    'tool-3': tool3,
  },
});
```

### **4. Fallback Mechanisms**

```typescript
// Agent Tool Calling with Fallback
const response = await agent.generate([{ role: 'user', content: prompt }]);

if (response.toolCalls && response.toolCalls.length > 0) {
  // Agent called tools naturally
  for (const toolCall of response.toolCalls) {
    await emitToolEvents(toolCall);
  }
} else {
  // Fallback: Manual tool execution
  console.log('⚠️ Agent did not call tools, manually triggering');
  const result = await yourTool.execute({ context: params });
  await emitManualToolEvents(result);
}
```

## 🧪 **Testing Patterns**

### **Direct Tool Testing**
```typescript
// Create test endpoints for each tool
router.post('/test/your-tool', async (req, res) => {
  const result = await yourTool.execute({ context: req.body.params });
  res.json({
    tool: 'Your Tool Name',
    dataType: 'Real-time/Mock/Historical',
    result
  });
});
```

### **Automated Testing Script**
```javascript
// test-tools.js
async function testTool(toolName, endpoint, params) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ params })
  });
  
  const data = await response.json();
  console.log(`✅ ${toolName}: ${data.result.summary}`);
}
```

## 📋 **Integration Checklist**

### **Backend Setup**
- [ ] Install AG-UI dependencies (`@ag-ui/core`, `@ag-ui/encoder`)
- [ ] Set up Server-Sent Events endpoints
- [ ] Implement EventEncoder for proper event structure
- [ ] Create multiple tools with different data sources
- [ ] Add fallback mechanisms for tool execution
- [ ] Implement comprehensive error handling

### **Frontend Setup**
- [ ] Create SSE event handling hooks
- [ ] Implement progressive workflow visualization
- [ ] Add event filtering and display customization
- [ ] Create real-time status indicators
- [ ] Add proper loading states and animations

### **Testing Setup**
- [ ] Create direct tool testing endpoints
- [ ] Implement automated testing scripts
- [ ] Add event debugging and monitoring
- [ ] Test all 24 AG-UI event types
- [ ] Validate fallback mechanisms

## 🔧 **Reusable Components**

### **Event Handler Hook**
```typescript
// useAGUIEvents.ts - Reusable for any application
export const useAGUIEvents = (apiUrl: string) => {
  const [events, setEvents] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const sendRequest = async (endpoint: string, data: any) => {
    // SSE handling logic
  };
  
  return { events, isStreaming, sendRequest };
};
```

### **Progressive Checklist Component**
```typescript
// ProgressiveChecklist.tsx - Reusable workflow visualization
export const ProgressiveChecklist = ({ 
  steps, 
  completedEvents, 
  isStreaming 
}) => {
  // Progressive checklist UI logic
};
```

## 🎯 **Next Steps for Integration**

1. **Extract Reusable Patterns** - Create AG-UI integration templates
2. **Build AG-UI SDK** - Package common patterns into reusable library
3. **Create Integration Templates** - Boilerplate for different use cases
4. **Document Best Practices** - Guidelines for optimal AG-UI integration

## 📚 **Reference Implementation**

This flight booking application serves as the complete reference for:
- ✅ All 24 AG-UI event types
- ✅ Multiple tool integration patterns
- ✅ Real-time API integration
- ✅ Fallback mechanisms
- ✅ Progressive UI visualization
- ✅ Comprehensive testing

**Use this codebase as your AG-UI Protocol integration reference for any future applications.**