import { EventType } from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';
import { Agent } from '@mastra/core/agent';
import { Response } from 'express';

export interface StreamingContext {
  threadId: string;
  runId: string;
  messageId: string;
  res: Response;
  encoder: EventEncoder;
}

export class AgentStreamer {
  private context: StreamingContext;

  constructor(context: StreamingContext) {
    this.context = context;
  }

  // Emit any AG-UI event with proper structure
  private emit(eventType: keyof typeof EventType, data: any = {}) {
    try {
      // Create the event with proper AG-UI structure
      const event = {
        type: EventType[eventType],
        timestamp: Date.now(),
        ...data,
      };
      
      this.context.res.write(this.context.encoder.encode(event));
    } catch (error) {
      console.error(`Failed to emit event ${eventType}:`, error);
      // Fallback to simple event
      this.context.res.write(`data: ${JSON.stringify({
        type: eventType,
        ...data,
      })}\n\n`);
    }
  }

  // Start the agent run
  async startRun() {
    this.emit('RUN_STARTED', {
      threadId: this.context.threadId,
      runId: this.context.runId,
    });
  }

  // Start a step (for workflow-like operations)
  async startStep(stepName: string, stepId?: string) {
    this.emit('STEP_STARTED', {
      stepId: stepId || `step-${Date.now()}`,
      stepName,
      threadId: this.context.threadId,
      runId: this.context.runId,
    });
  }

  // Finish a step
  async finishStep(stepId: string, result?: any) {
    this.emit('STEP_FINISHED', {
      stepId,
      result,
      threadId: this.context.threadId,
      runId: this.context.runId,
    });
  }

  // Start thinking (internal reasoning)
  async startThinking() {
    this.emit('THINKING_START', {
      messageId: this.context.messageId,
    });
  }

  // Stream thinking content
  async streamThinking(content: string) {
    this.emit('THINKING_TEXT_MESSAGE_CONTENT', {
      messageId: this.context.messageId,
      delta: content,
    });
  }

  // End thinking
  async endThinking() {
    this.emit('THINKING_END', {
      messageId: this.context.messageId,
    });
  }

  // Start a text message
  async startMessage(role: string = 'assistant') {
    this.emit('TEXT_MESSAGE_START', {
      messageId: this.context.messageId,
      role,
    });
  }

  // Stream text content
  async streamText(content: string) {
    this.emit('TEXT_MESSAGE_CONTENT', {
      messageId: this.context.messageId,
      delta: content,
    });
  }

  // Stream text chunk (larger chunks)
  async streamTextChunk(content: string) {
    this.emit('TEXT_MESSAGE_CHUNK', {
      messageId: this.context.messageId,
      chunk: content,
    });
  }

  // End text message
  async endMessage() {
    this.emit('TEXT_MESSAGE_END', {
      messageId: this.context.messageId,
    });
  }

  // Start tool call
  async startToolCall(toolCallId: string, toolName: string, parentMessageId?: string) {
    this.emit('TOOL_CALL_START', {
      toolCallId,
      toolCallName: toolName,
      parentMessageId: parentMessageId || this.context.messageId,
    });
  }

  // Stream tool arguments
  async streamToolArgs(toolCallId: string, args: string) {
    this.emit('TOOL_CALL_ARGS', {
      toolCallId,
      delta: args,
    });
  }

  // Stream tool call chunk
  async streamToolChunk(toolCallId: string, chunk: any) {
    this.emit('TOOL_CALL_CHUNK', {
      toolCallId,
      chunk,
    });
  }

  // End tool call with result
  async endToolCall(toolCallId: string, result?: any) {
    if (result) {
      this.emit('TOOL_CALL_RESULT', {
        toolCallId,
        result,
      });
    }
    
    this.emit('TOOL_CALL_END', {
      toolCallId,
    });
  }

  // Emit state snapshot
  async emitStateSnapshot(state: any) {
    this.emit('STATE_SNAPSHOT', {
      state,
      threadId: this.context.threadId,
      runId: this.context.runId,
    });
  }

  // Emit state delta (incremental changes)
  async emitStateDelta(delta: any) {
    this.emit('STATE_DELTA', {
      delta,
      threadId: this.context.threadId,
      runId: this.context.runId,
    });
  }

  // Emit messages snapshot
  async emitMessagesSnapshot(messages: any[]) {
    this.emit('MESSAGES_SNAPSHOT', {
      messages,
      threadId: this.context.threadId,
      runId: this.context.runId,
    });
  }

  // Emit custom event
  async emitCustom(name: string, value: any) {
    this.emit('CUSTOM', {
      name,
      value,
    });
  }

  // Emit raw event (for debugging or special cases)
  async emitRaw(data: any) {
    this.emit('RAW', data);
  }

  // Finish the agent run
  async finishRun(result?: any) {
    this.emit('RUN_FINISHED', {
      threadId: this.context.threadId,
      runId: this.context.runId,
      result,
    });
  }

  // Handle run error
  async errorRun(error: Error | string, code?: string) {
    this.emit('RUN_ERROR', {
      message: error instanceof Error ? error.message : error,
      code: code || 'AGENT_ERROR',
      threadId: this.context.threadId,
      runId: this.context.runId,
    });
  }

  // Comprehensive agent execution with full event streaming
  async executeAgent(agent: Agent, messages: any[], options: {
    enableThinking?: boolean;
    enableSteps?: boolean;
    enableStateTracking?: boolean;
    simulateDelay?: number;
  } = {}) {
    try {
      await this.startRun();

      // Optional: Start thinking phase
      if (options.enableThinking) {
        await this.startThinking();
        await this.streamThinking('Analyzing user request and determining best approach...');
        await new Promise(resolve => setTimeout(resolve, options.simulateDelay || 500));
        await this.endThinking();
      }

      // Optional: Step-based execution
      if (options.enableSteps) {
        const stepId = 'analysis-step';
        await this.startStep('Request Analysis', stepId);
        await new Promise(resolve => setTimeout(resolve, options.simulateDelay || 300));
        await this.finishStep(stepId, { status: 'completed' });
      }

      // Start message composition
      await this.startMessage('assistant');

      // Generate response using Mastra agent
      const response = await agent.generate(messages);

      // Handle tool calls if present
      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
          const toolCallId = toolCall.toolCallId || `tool-${Date.now()}`;
          
          await this.startToolCall(toolCallId, toolCall.toolName);
          
          // Stream tool arguments
          const argsString = JSON.stringify(toolCall.args, null, 2);
          const argChunks = argsString.match(/.{1,20}/g) || [argsString];
          for (const chunk of argChunks) {
            await this.streamToolArgs(toolCallId, chunk);
            await new Promise(resolve => setTimeout(resolve, options.simulateDelay || 50));
          }
          
          await this.endToolCall(toolCallId, toolCall.result);

          // Emit custom event for specific tool results
          if (toolCall.toolName === 'search-flights' && toolCall.result) {
            await this.emitCustom('FLIGHT_SEARCH_RESULT', toolCall.result);
          }
        }
      }

      // Stream the text response
      if (response.text) {
        const textChunks = response.text.match(/.{1,15}/g) || [response.text];
        for (const chunk of textChunks) {
          await this.streamText(chunk);
          await new Promise(resolve => setTimeout(resolve, options.simulateDelay || 50));
        }
      }

      // Optional: Emit state tracking
      if (options.enableStateTracking) {
        await this.emitStateSnapshot({
          currentStep: 'completed',
          toolsUsed: response.toolCalls?.map(tc => tc.toolName) || [],
          messageCount: messages.length + 1,
        });
      }

      await this.endMessage();
      await this.finishRun({ 
        success: true, 
        toolCallCount: response.toolCalls?.length || 0 
      });

      return response;

    } catch (error) {
      console.error('Agent execution error:', error);
      await this.errorRun(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}