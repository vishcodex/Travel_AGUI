// @ts-nocheck
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { FlightSearchParams } from '@shared/types/flight.js';
import { mockFlightSearch } from '../services/flightService.js';

// Step 1: Validate and process search parameters
const validateSearchStep = createStep({
  id: 'validate-search',
  description: 'Validate and process flight search parameters',
  inputSchema: z.object({
    origin: z.string(),
    destination: z.string(),
    departureDate: z.string(),
    returnDate: z.string().optional(),
    passengers: z.object({
      adults: z.number(),
      children: z.number(),
      infants: z.number(),
    }),
    class: z.enum(['economy', 'premium-economy', 'business', 'first']),
    tripType: z.enum(['one-way', 'round-trip']),
  }),
  outputSchema: z.object({
    searchParams: z.any(),
    isValid: z.boolean(),
    errors: z.array(z.string()).optional(),
  }),
  execute: async ({ inputData }) => {
    const errors: string[] = [];

    // Basic validation
    if (!inputData.origin || inputData.origin.length < 3) {
      errors.push('Valid origin airport code is required');
    }
    if (!inputData.destination || inputData.destination.length < 3) {
      errors.push('Valid destination airport code is required');
    }
    if (!inputData.departureDate) {
      errors.push('Departure date is required');
    }
    if (inputData.passengers.adults < 1) {
      errors.push('At least one adult passenger is required');
    }

    const searchParams: FlightSearchParams = {
      origin: inputData.origin.toUpperCase(),
      destination: inputData.destination.toUpperCase(),
      departureDate: inputData.departureDate,
      returnDate: inputData.returnDate,
      passengers: inputData.passengers,
      class: inputData.class,
      tripType: inputData.tripType,
    };

    return {
      searchParams,
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});

// Step 2: Search for flights
const searchFlightsStep = createStep({
  id: 'search-flights',
  description: 'Search for available flights',
  inputSchema: z.object({
    searchParams: z.any(),
    isValid: z.boolean(),
  }),
  outputSchema: z.object({
    searchResults: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData.isValid) {
      return {
        error: 'Invalid search parameters',
      };
    }

    try {
      const searchResults = await mockFlightSearch(inputData.searchParams);
      return {
        searchResults,
      };
    } catch (error) {
      return {
        error: `Flight search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

// Step 3: Process and format results
const formatResultsStep = createStep({
  id: 'format-results',
  description: 'Format flight search results for presentation',
  inputSchema: z.object({
    searchResults: z.any().optional(),
    error: z.string().optional(),
  }),
  outputSchema: z.object({
    formattedResults: z.object({
      success: z.boolean(),
      flights: z.array(z.any()).optional(),
      summary: z.string(),
      totalResults: z.number(),
      searchId: z.string().optional(),
      error: z.string().optional(),
    }),
  }),
  execute: async ({ inputData }) => {
    if (inputData.error || !inputData.searchResults) {
      return {
        formattedResults: {
          success: false,
          summary: inputData.error || 'No search results available',
          totalResults: 0,
          error: inputData.error,
        },
      };
    }

    const { flights, searchId, totalResults } = inputData.searchResults;

    // Sort flights by price
    const sortedFlights = flights.sort((a: any, b: any) => a.price.amount - b.price.amount);

    // Generate summary
    const priceRange = flights.length > 0 
      ? `$${Math.min(...flights.map((f: any) => f.price.amount))} - $${Math.max(...flights.map((f: any) => f.price.amount))}`
      : 'N/A';

    const summary = `Found ${totalResults} flights. Price range: ${priceRange}. Best value options are highlighted.`;

    return {
      formattedResults: {
        success: true,
        flights: sortedFlights,
        summary,
        totalResults,
        searchId,
      },
    };
  },
});

// Create the flight booking workflow
export const flightBookingWorkflow = createWorkflow({
  id: 'flight-booking-workflow',
  description: 'Complete flight search and booking workflow',
  inputSchema: z.object({
    origin: z.string(),
    destination: z.string(),
    departureDate: z.string(),
    returnDate: z.string().optional(),
    passengers: z.object({
      adults: z.number(),
      children: z.number(),
      infants: z.number(),
    }),
    class: z.enum(['economy', 'premium-economy', 'business', 'first']),
    tripType: z.enum(['one-way', 'round-trip']),
  }),
  outputSchema: z.object({
    formattedResults: z.object({
      success: z.boolean(),
      flights: z.array(z.any()).optional(),
      summary: z.string(),
      totalResults: z.number(),
      searchId: z.string().optional(),
      error: z.string().optional(),
    }),
  }),
})
  .then(validateSearchStep)
  .then(searchFlightsStep)
  .then(formatResultsStep)
  .commit();