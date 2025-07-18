import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { flightBookingAgent } from './agents/flightSearchAgent.js';
import { flightBookingWorkflow } from './workflows/flightBookingWorkflow.js';

// Create the main Mastra instance
export const mastra = new Mastra({
  agents: {
    flightBookingAgent,
  },
  workflows: {
    flightBookingWorkflow,
  },
  logger: new PinoLogger({
    name: 'FlightBookingMastra',
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  }),
});

// Export individual components for direct access
export { flightBookingAgent } from './agents/flightSearchAgent.js';
export { flightBookingWorkflow } from './workflows/flightBookingWorkflow.js';