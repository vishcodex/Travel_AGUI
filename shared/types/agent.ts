import { FlightSearchParams, FlightSearchResponse } from './flight.js';
import { BookingRequest, Booking } from './booking.js';

// AG-UI Protocol event types specific to flight booking
export interface FlightSearchStartEvent {
  type: 'FLIGHT_SEARCH_START';
  searchParams: FlightSearchParams;
}

export interface FlightSearchResultEvent {
  type: 'FLIGHT_SEARCH_RESULT';
  results: FlightSearchResponse;
}

export interface FlightSelectedEvent {
  type: 'FLIGHT_SELECTED';
  flightId: string;
}

export interface BookingStartEvent {
  type: 'BOOKING_START';
  flightId: string;
}

export interface BookingCompleteEvent {
  type: 'BOOKING_COMPLETE';
  booking: Booking;
}

export interface BookingErrorEvent {
  type: 'BOOKING_ERROR';
  error: string;
  code?: string;
}

// Agent state for flight booking
export interface FlightBookingAgentState {
  currentStep: 'search' | 'results' | 'selection' | 'booking' | 'confirmation';
  searchParams?: FlightSearchParams;
  searchResults?: FlightSearchResponse;
  selectedFlight?: string;
  booking?: Booking;
  error?: string;
}

// Tool definitions for flight booking agents
export interface FlightSearchTool {
  name: 'searchFlights';
  description: 'Search for flights based on user criteria';
  parameters: {
    type: 'object';
    properties: {
      origin: { type: 'string'; description: 'Origin airport code' };
      destination: { type: 'string'; description: 'Destination airport code' };
      departureDate: { type: 'string'; description: 'Departure date (YYYY-MM-DD)' };
      returnDate: { type: 'string'; description: 'Return date for round trip (YYYY-MM-DD)' };
      passengers: {
        type: 'object';
        properties: {
          adults: { type: 'number' };
          children: { type: 'number' };
          infants: { type: 'number' };
        };
      };
      class: { type: 'string'; enum: ['economy', 'premium-economy', 'business', 'first'] };
    };
    required: ['origin', 'destination', 'departureDate', 'passengers'];
  };
}

export interface BookFlightTool {
  name: 'bookFlight';
  description: 'Book a selected flight with passenger and payment details';
  parameters: {
    type: 'object';
    properties: {
      flightId: { type: 'string'; description: 'ID of the selected flight' };
      passengers: {
        type: 'array';
        items: {
          type: 'object';
          properties: {
            firstName: { type: 'string' };
            lastName: { type: 'string' };
            dateOfBirth: { type: 'string' };
            // ... other passenger fields
          };
        };
      };
      contact: {
        type: 'object';
        properties: {
          email: { type: 'string' };
          phone: { type: 'string' };
        };
      };
    };
    required: ['flightId', 'passengers', 'contact'];
  };
}