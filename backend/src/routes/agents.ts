import express from 'express';
import { EventType } from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';
import { mastra } from '../mastra.js';
import { FlightSearchParams } from '@shared/types/flight.js';

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

    // Emit run started
    res.write(encoder.encode({
      type: EventType.RUN_STARTED,
      threadId,
      runId,
    }));

    try {
      const agent = mastra.getAgent('flightBookingAgent');
      
      if (!agent) {
        throw new Error('Flight booking agent not found');
      }

      let prompt: string;
      
      if (searchParams) {
        // Handle structured flight search
        prompt = `Please search for flights with these details:
- From: ${searchParams.origin}
- To: ${searchParams.destination}  
- Departure: ${searchParams.departureDate}
- Return: ${searchParams.returnDate || 'One way'}
- Passengers: ${searchParams.passengers.adults} adults, ${searchParams.passengers.children} children, ${searchParams.passengers.infants} infants
- Class: ${searchParams.class}

Use the flight search tool to find available options.`;
      } else if (message) {
        // Handle conversational message
        prompt = message;
      } else {
        throw new Error('Either searchParams or message is required');
      }

      // Start message
      const messageId = Date.now().toString();
      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant',
      }));

      // Generate response using Mastra agent
      const response = await agent.stream([
        { role: 'user', content: prompt }
      ]);

      // Stream the response
      for await (const chunk of response.textStream) {
        res.write(encoder.encode({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: chunk,
        }));
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
      console.error('Agent execution error:', error);
      
      res.write(encoder.encode({
        type: EventType.RUN_ERROR,
        message: error instanceof Error ? error.message : 'Agent execution failed',
        code: 'AGENT_ERROR',
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

    // Emit run started
    res.write(encoder.encode({
      type: EventType.RUN_STARTED,
      threadId,
      runId,
    }));

    try {
      const agent = mastra.getAgent('flightBookingAgent');
      
      if (!agent) {
        throw new Error('Flight booking agent not found');
      }

      // Start message
      const messageId = Date.now().toString();
      res.write(encoder.encode({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant',
      }));

      // Generate response using Mastra agent
      const response = await agent.stream([
        { role: 'user', content: message }
      ]);

      // Stream the response
      for await (const chunk of response.textStream) {
        res.write(encoder.encode({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: chunk,
        }));
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
      console.error('Chat execution error:', error);
      
      res.write(encoder.encode({
        type: EventType.RUN_ERROR,
        message: error instanceof Error ? error.message : 'Chat execution failed',
        code: 'CHAT_ERROR',
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
      const messageId = Date.now().toString();
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
      }));
    }

    res.end();
  } catch (error) {
    console.error('Workflow route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as agentRoutes };