import { createOpenAI } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { FlightSearchParams } from '@shared/types/flight.js';
import { mockFlightSearch } from '../services/flightService.js';

// Create OpenRouter client using the working method
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Create flight search tool
export const flightSearchTool = createTool({
  id: 'search-flights',
  description: 'Search for flights based on user criteria including origin, destination, dates, and passenger details',
  inputSchema: z.object({
    origin: z.string().describe('Origin airport code (e.g., NYC, LAX)'),
    destination: z.string().describe('Destination airport code (e.g., NYC, LAX)'),
    departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
    returnDate: z.string().optional().describe('Return date for round trip in YYYY-MM-DD format'),
    passengers: z.object({
      adults: z.number().min(1).describe('Number of adult passengers'),
      children: z.number().min(0).describe('Number of child passengers'),
      infants: z.number().min(0).describe('Number of infant passengers'),
    }),
    class: z.enum(['economy', 'premium-economy', 'business', 'first']).describe('Flight class preference'),
    tripType: z.enum(['one-way', 'round-trip']).describe('Type of trip'),
  }),
  outputSchema: z.object({
    flights: z.array(z.any()),
    searchId: z.string(),
    totalResults: z.number(),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    const searchParams: FlightSearchParams = {
      origin: context.origin,
      destination: context.destination,
      departureDate: context.departureDate,
      returnDate: context.returnDate,
      passengers: context.passengers,
      class: context.class,
      tripType: context.tripType,
    };

    // Search for flights using mock service
    const searchResults = await mockFlightSearch(searchParams);

    // Generate summary
    const summary = `Found ${searchResults.flights.length} flights from ${searchParams.origin} to ${searchParams.destination} on ${searchParams.departureDate}. Price range: $${Math.min(...searchResults.flights.map(f => f.price.amount))} - $${Math.max(...searchResults.flights.map(f => f.price.amount))}.`;

    return {
      flights: searchResults.flights,
      searchId: searchResults.searchId,
      totalResults: searchResults.totalResults,
      summary,
    };
  },
});

// Create flight booking assistant agent
export const flightBookingAgent = new Agent({
  name: 'flightBookingAgent',
  instructions: `You are a helpful flight booking assistant. Your role is to:

1. Help users search for flights by gathering their travel requirements
2. Present flight options in a clear, organized manner
3. Explain flight details, pricing, and booking terms
4. Guide users through the booking process
5. Answer questions about flights, airlines, and travel policies

When helping users:
- Always ask for missing required information (origin, destination, dates, passengers)
- Use the flight search tool to find available flights
- Present results clearly with key details like price, duration, and stops
- Highlight the best value options and explain why
- Be conversational and friendly while remaining professional
- If users need to modify their search, help them refine their criteria

Available tools:
- search-flights: Use this to search for flights based on user criteria

Always use the search tool when users want to find flights, and present the results in a user-friendly format.`,
  model: openrouter('openai/gpt-3.5-turbo'),
  tools: {
    flightSearchTool,
  },
});