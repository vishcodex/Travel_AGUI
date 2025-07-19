// @ts-nocheck
import express from 'express';
import { EventType } from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';
import { mastra } from '../mastra.js';

const router = express.Router();
const encoder = new EventEncoder();

// AG-UI Protocol endpoint for flight booking agent
router.post('/flight-search', async (req, res) => {
  try {
    const { threadId, runId, searchParams, message } = req.body;

    if (!threadId || !runId) {
      return res.status(400).json({ error: 'threadId and runId are required' });
    }

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      const agent = mastra.getAgent('flightBookingAgent');

      if (!agent) {
        throw new Error('Flight booking agent not found');
      }

      let prompt: string;

      if (searchParams) {
        // Handle structured flight search
        prompt = `I need you to search for flights using one of your available flight search tools with these exact parameters:
- Origin: ${searchParams.origin}
- Destination: ${searchParams.destination}  
- Departure Date: ${searchParams.departureDate}
- Return Date: ${searchParams.returnDate || null}
- Passengers: ${searchParams.passengers.adults} adults, ${searchParams.passengers.children} children, ${searchParams.passengers.infants} infants
- Class: ${searchParams.class}
- Trip Type: ${searchParams.tripType}

Please call one of your flight search tools now with these parameters to find available flight options.`;
      } else if (message) {
        // Handle conversational message
        prompt = message;
      } else {
        throw new Error('Either searchParams or message is required');
      }

      const messageId = Date.now().toString();

      // Start run
      res.write(encoder.encode({
        type: EventType.RUN_STARTED,
        threadId,
        runId,
      }));

      // Simulate thinking
      res.write(encoder.encode({
        type: EventType.THINKING_START,
        messageId,
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
      res.write(encoder.encode({
        type: EventType.THINKING_END,
        messageId,
      }));

      // Start step
      const stepId = 'analysis-step';
      res.write(encoder.encode({
        type: EventType.STEP_STARTED,
        stepId,
        stepName: 'Request Analysis',
        threadId,
        runId,
      }));

      // Start message
      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant',
      }));

      // Generate response using Mastra agent
      console.log('🔍 Sending prompt to agent:', prompt);
      const response = await agent.generate([
        { role: 'user', content: prompt }
      ]);

      console.log('📝 Agent response:', {
        text: response.text?.slice(0, 100) + '...',
        toolCalls: response.toolCalls?.length || 0,
        toolCallDetails: response.toolCalls?.map(tc => ({ name: tc.toolName, id: tc.toolCallId }))
      });

      // Handle tool calls if present, or manually trigger if needed
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log('✅ Agent called tools:', response.toolCalls.length);
        for (const toolCall of response.toolCalls) {
          const toolCallId = toolCall.toolCallId || `tool-${Date.now()}`;

          // Emit tool call start
          res.write(encoder.encode({
            type: EventType.TOOL_CALL_START,
            toolCallId,
            toolCallName: toolCall.toolName,
            parentMessageId: messageId,
          }));
          await new Promise(resolve => setTimeout(resolve, 200));

          // Emit tool arguments
          res.write(encoder.encode({
            type: EventType.TOOL_CALL_ARGS,
            toolCallId,
            delta: JSON.stringify(toolCall.args, null, 2),
          }));
          await new Promise(resolve => setTimeout(resolve, 300));

          // Emit tool result
          res.write(encoder.encode({
            type: EventType.TOOL_CALL_RESULT,
            toolCallId,
            result: toolCall.result,
          }));
          await new Promise(resolve => setTimeout(resolve, 200));

          // Emit tool call end
          res.write(encoder.encode({
            type: EventType.TOOL_CALL_END,
            toolCallId,
          }));

          // If it's a flight search, emit custom event with results
          if (toolCall.toolName === 'search-flights' && toolCall.result) {
            res.write(encoder.encode({
              type: EventType.CUSTOM,
              name: 'FLIGHT_SEARCH_RESULT',
              value: toolCall.result,
            }));
          }
        }
      } else if (searchParams) {
        // Fallback: If agent didn't call tools but we have search params, manually trigger tool
        console.log('⚠️ Agent did not call tools, manually triggering flight search');

        const toolCallId = `manual-tool-${Date.now()}`;

        // Emit tool call start
        res.write(encoder.encode({
          type: EventType.TOOL_CALL_START,
          toolCallId,
          toolCallName: 'search-live-flights',
          parentMessageId: messageId,
        }));
        await new Promise(resolve => setTimeout(resolve, 200));

        // Emit tool arguments
        const toolArgs = {
          origin: searchParams.origin,
          destination: searchParams.destination,
          departureDate: searchParams.departureDate,
          returnDate: searchParams.returnDate,
          passengers: searchParams.passengers,
          class: searchParams.class,
          tripType: searchParams.tripType,
        };

        res.write(encoder.encode({
          type: EventType.TOOL_CALL_ARGS,
          toolCallId,
          delta: JSON.stringify(toolArgs, null, 2),
        }));
        await new Promise(resolve => setTimeout(resolve, 300));

        // Manually execute the live flight search tool (FREE API)
        const { searchFlightsOpenSky } = await import('../services/realFlightService.js');
        const searchResults = await searchFlightsOpenSky(searchParams);

        // Emit tool result
        res.write(encoder.encode({
          type: EventType.TOOL_CALL_RESULT,
          toolCallId,
          result: searchResults,
        }));
        await new Promise(resolve => setTimeout(resolve, 200));

        // Emit tool call end
        res.write(encoder.encode({
          type: EventType.TOOL_CALL_END,
          toolCallId,
        }));

        // Emit custom event with results
        res.write(encoder.encode({
          type: EventType.CUSTOM,
          name: 'FLIGHT_SEARCH_RESULT',
          value: searchResults,
        }));
      }

      // Stream the text response
      if (response.text) {
        const textChunks = response.text.match(/.{1,15}/g) || [response.text];
        for (const chunk of textChunks) {
          res.write(encoder.encode({
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId,
            delta: chunk,
          }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // State snapshot
      res.write(encoder.encode({
        type: EventType.STATE_SNAPSHOT,
        state: {
          currentStep: 'completed',
          toolsUsed: response.toolCalls?.map(tc => tc.toolName) || [],
          messageCount: 1,
        },
        threadId,
        runId,
      }));

      // End message
      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_END,
        messageId,
      }));

      // Finish step
      res.write(encoder.encode({
        type: EventType.STEP_FINISHED,
        stepId,
        result: { status: 'completed' },
        threadId,
        runId,
      }));

      // Finish run
      res.write(encoder.encode({
        type: EventType.RUN_FINISHED,
        threadId,
        runId,
        result: {
          success: true,
          toolCallCount: response.toolCalls?.length || 0
        },
      }));

    } catch (error) {
      console.error('Agent execution error:', error);

      res.write(encoder.encode({
        type: EventType.RUN_ERROR,
        message: error instanceof Error ? error.message : 'Agent execution failed',
        code: 'AGENT_ERROR',
        threadId,
        runId,
      }));
    }

    res.end();
  } catch (error) {
    console.error('Agent route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// General conversation endpoint
router.post('/chat', async (req, res) => {
  try {
    const { threadId, runId, message } = req.body;

    if (!threadId || !runId || !message) {
      return res.status(400).json({ error: 'threadId, runId, and message are required' });
    }

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      const agent = mastra.getAgent('flightBookingAgent');

      if (!agent) {
        throw new Error('Flight booking agent not found');
      }

      const messageId = Date.now().toString();

      // Start run
      res.write(encoder.encode({
        type: EventType.RUN_STARTED,
        threadId,
        runId,
      }));

      // Start message
      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant',
      }));

      // Generate response using Mastra agent
      const response = await agent.generate([
        { role: 'user', content: message }
      ]);

      // Handle tool calls if present
      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
          const toolCallId = toolCall.toolCallId || `tool-${Date.now()}`;

          // Emit tool call events
          res.write(encoder.encode({
            type: EventType.TOOL_CALL_START,
            toolCallId,
            toolCallName: toolCall.toolName,
            parentMessageId: messageId,
          }));

          res.write(encoder.encode({
            type: EventType.TOOL_CALL_ARGS,
            toolCallId,
            delta: JSON.stringify(toolCall.args, null, 2),
          }));

          res.write(encoder.encode({
            type: EventType.TOOL_CALL_RESULT,
            toolCallId,
            result: toolCall.result,
          }));

          res.write(encoder.encode({
            type: EventType.TOOL_CALL_END,
            toolCallId,
          }));

          if (toolCall.toolName === 'search-flights' && toolCall.result) {
            res.write(encoder.encode({
              type: EventType.CUSTOM,
              name: 'FLIGHT_SEARCH_RESULT',
              value: toolCall.result,
            }));
          }
        }
      }

      // Stream the text response
      if (response.text) {
        const textChunks = response.text.match(/.{1,15}/g) || [response.text];
        for (const chunk of textChunks) {
          res.write(encoder.encode({
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId,
            delta: chunk,
          }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // End message
      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_END,
        messageId,
      }));

      // Finish run
      res.write(encoder.encode({
        type: EventType.RUN_FINISHED,
        threadId,
        runId,
      }));

    } catch (error) {
      console.error('Chat execution error:', error);

      res.write(encoder.encode({
        type: EventType.RUN_ERROR,
        message: error instanceof Error ? error.message : 'Chat execution failed',
        code: 'CHAT_ERROR',
        threadId,
        runId,
      }));
    }

    res.end();
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Workflow execution endpoint
router.post('/workflow', async (req, res) => {
  try {
    const { threadId, runId, workflowId, inputData } = req.body;

    if (!threadId || !runId || !workflowId || !inputData) {
      return res.status(400).json({
        error: 'threadId, runId, workflowId, and inputData are required'
      });
    }

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const messageId = Date.now().toString();

    // Emit run started
    res.write(encoder.encode({
      type: EventType.RUN_STARTED,
      threadId,
      runId,
    }));

    try {
      const workflow = mastra.getWorkflow(workflowId);

      if (!workflow) {
        throw new Error(`Workflow '${workflowId}' not found`);
      }

      // Start message
      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant',
      }));

      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId,
        delta: `🔄 Executing workflow: ${workflowId}...\n\n`,
      }));

      // Execute workflow
      const run = workflow.createRun();
      const result = await run.start({ inputData });

      if (result.status === 'success') {
        res.write(encoder.encode({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: `✅ Workflow completed successfully!\n\n`,
        }));

        // Emit workflow results as custom event
        res.write(encoder.encode({
          type: EventType.CUSTOM,
          name: 'WORKFLOW_RESULT',
          value: result.result,
        }));
      } else {
        throw new Error(`Workflow execution failed: ${result.status}`);
      }

      // End message
      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_END,
        messageId,
      }));

      // Emit run finished
      res.write(encoder.encode({
        type: EventType.RUN_FINISHED,
        threadId,
        runId,
      }));

    } catch (error) {
      console.error('Workflow execution error:', error);

      res.write(encoder.encode({
        type: EventType.RUN_ERROR,
        message: error instanceof Error ? error.message : 'Workflow execution failed',
        code: 'WORKFLOW_ERROR',
        threadId,
        runId,
      }));
    }

    res.end();
  } catch (error) {
    console.error('Workflow route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as agentRoutes };