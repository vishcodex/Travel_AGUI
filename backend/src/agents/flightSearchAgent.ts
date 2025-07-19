import { createOpenAI } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { FlightSearchParams } from '@shared/types/flight.js';

import { 
  searchFlightsOpenSky, 
  searchFlightsWithWeather, 
  searchHistoricalFlights,
  createEnhancedMockFlights 
} from '../services/realFlightService.js';

// Create OpenRouter client using the working method
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Shared input schema for all flight search tools
const flightSearchInputSchema = z.object({
  origin: z.string().describe('Origin airport code (e.g., NYC, LAX)'),
  destination: z.string().describe('Destination airport code (e.g., NYC, LAX)'),
  departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
  returnDate: z.string().optional().nullable().describe('Return date for round trip in YYYY-MM-DD format'),
  passengers: z.object({
    adults: z.number().min(1).describe('Number of adult passengers'),
    children: z.number().min(0).describe('Number of child passengers'),
    infants: z.number().min(0).describe('Number of infant passengers'),
  }),
  class: z.enum(['economy', 'premium-economy', 'business', 'first']).describe('Flight class preference'),
  tripType: z.enum(['one-way', 'round-trip']).describe('Type of trip'),
});

// Shared output schema for all flight search tools
const flightSearchOutputSchema = z.object({
  flights: z.array(z.any()),
  searchId: z.string(),
  totalResults: z.number(),
  provider: z.string(),
  summary: z.string(),
});

// Tool 1: Live Flight Search using OpenSky Network (FREE)
export const liveFlightSearchTool = createTool({
  id: 'search-live-flights',
  description: 'Search for flights using real-time flight data from OpenSky Network API (completely free)',
  inputSchema: flightSearchInputSchema,
  outputSchema: flightSearchOutputSchema,
  execute: async ({ context }) => {
    const searchParams: FlightSearchParams = {
      origin: context.origin,
      destination: context.destination,
      departureDate: context.departureDate,
      returnDate: context.returnDate || undefined,
      passengers: context.passengers,
      class: context.class,
      tripType: context.tripType,
    };

    const searchResults = await searchFlightsOpenSky(searchParams);
    const summary = `Found ${searchResults.flights.length} live flights from ${searchParams.origin} to ${searchParams.destination}. Using real-time data from OpenSky Network. Price range: $${Math.min(...searchResults.flights.map((f: any) => f.price.amount))} - $${Math.max(...searchResults.flights.map((f: any) => f.price.amount))}.`;

    return {
      flights: searchResults.flights,
      searchId: searchResults.searchId,
      totalResults: searchResults.totalResults,
      provider: searchResults.provider,
      summary,
    };
  },
});

// Tool 2: Weather-Enhanced Flight Search (FREE)
export const weatherFlightSearchTool = createTool({
  id: 'search-flights-weather',
  description: 'Search for flights with real-time weather data and delay predictions (free weather API)',
  inputSchema: flightSearchInputSchema,
  outputSchema: flightSearchOutputSchema,
  execute: async ({ context }) => {
    const searchParams: FlightSearchParams = {
      origin: context.origin,
      destination: context.destination,
      departureDate: context.departureDate,
      returnDate: context.returnDate || undefined,
      passengers: context.passengers,
      class: context.class,
      tripType: context.tripType,
    };

    const searchResults = await searchFlightsWithWeather(searchParams);
    const summary = `Found ${searchResults.flights.length} flights with weather analysis from ${searchParams.origin} to ${searchParams.destination}. Weather conditions and delay risks included. Price range: $${Math.min(...searchResults.flights.map((f: any) => f.price.amount))} - $${Math.max(...searchResults.flights.map((f: any) => f.price.amount))}.`;

    return {
      flights: searchResults.flights,
      searchId: searchResults.searchId,
      totalResults: searchResults.totalResults,
      provider: searchResults.provider,
      summary,
    };
  },
});

// Tool 3: Historical Flight Data Search (FREE)
export const historicalFlightSearchTool = createTool({
  id: 'search-flights-historical',
  description: 'Search for flights with historical performance data, price trends, and reliability metrics',
  inputSchema: flightSearchInputSchema,
  outputSchema: flightSearchOutputSchema,
  execute: async ({ context }) => {
    const searchParams: FlightSearchParams = {
      origin: context.origin,
      destination: context.destination,
      departureDate: context.departureDate,
      returnDate: context.returnDate || undefined,
      passengers: context.passengers,
      class: context.class,
      tripType: context.tripType,
    };

    const searchResults = searchHistoricalFlights(searchParams);
    const summary = `Found ${searchResults.flights.length} flights with historical performance data from ${searchParams.origin} to ${searchParams.destination}. Includes on-time performance, price history, and reliability metrics. Price range: $${Math.min(...searchResults.flights.map((f: any) => f.price.amount))} - $${Math.max(...searchResults.flights.map((f: any) => f.price.amount))}.`;

    return {
      flights: searchResults.flights,
      searchId: searchResults.searchId,
      totalResults: searchResults.totalResults,
      provider: searchResults.provider,
      summary,
    };
  },
});

// Tool 4: Enhanced Mock Flight Search (Fallback)
export const enhancedFlightSearchTool = createTool({
  id: 'search-flights-enhanced',
  description: 'Search for flights using enhanced mock data with realistic airline information and pricing',
  inputSchema: flightSearchInputSchema,
  outputSchema: flightSearchOutputSchema,
  execute: async ({ context }) => {
    const searchParams: FlightSearchParams = {
      origin: context.origin,
      destination: context.destination,
      departureDate: context.departureDate,
      returnDate: context.returnDate || undefined,
      passengers: context.passengers,
      class: context.class,
      tripType: context.tripType,
    };

    const searchResults = createEnhancedMockFlights(searchParams);
    const summary = `Found ${searchResults.flights.length} enhanced flights from ${searchParams.origin} to ${searchParams.destination}. Realistic airline data with detailed aircraft and amenity information. Price range: $${Math.min(...searchResults.flights.map((f: any) => f.price.amount))} - $${Math.max(...searchResults.flights.map((f: any) => f.price.amount))}.`;

    return {
      flights: searchResults.flights,
      searchId: searchResults.searchId,
      totalResults: searchResults.totalResults,
      provider: searchResults.provider,
      summary,
    };
  },
});

// Create flight booking assistant agent with multiple tools
export const flightBookingAgent = new Agent({
  name: 'flightBookingAgent',
  instructions: `You are a flight search assistant with access to multiple flight search tools. When a user asks you to search for flights, you MUST choose and use ONE of the available tools.

IMPORTANT: Always call one of the flight search tools when users provide flight search criteria. Do not provide flight information without using a tool first.

Your available tools:
- search-live-flights: Use real-time flight data from OpenSky Network (FREE)
- search-flights-weather: Include weather data and delay predictions (FREE)
- search-flights-historical: Show historical performance and price trends (FREE)
- search-flights-enhanced: Enhanced mock data with realistic details (FALLBACK)

Choose the most appropriate tool based on the user's needs:
- For real-time flight tracking: use search-live-flights
- For weather-sensitive travel: use search-flights-weather  
- For reliability analysis: use search-flights-historical
- For general searches: use search-flights-enhanced

When you receive flight search parameters, immediately call the most appropriate tool with the exact parameters provided.

FOR TESTING: Always use search-live-flights tool to test real-time data.`,
  model: openrouter('openai/gpt-4o-mini'), // Using GPT-4 which is better at tool calling
  tools: {
    'search-live-flights': liveFlightSearchTool,
    'search-flights-weather': weatherFlightSearchTool,
    'search-flights-historical': historicalFlightSearchTool,
    'search-flights-enhanced': enhancedFlightSearchTool,
  },
});