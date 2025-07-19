import { FlightSearchParams, FlightSearchResponse, Flight } from '@shared/types/flight.js';

// Mock flight data for development
const mockAirlines = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'SW', name: 'Southwest Airlines' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
];

const mockAirports = {
  'NYC': { code: 'NYC', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
  'LAX': { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' },
  'LHR': { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK' },
  'CDG': { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  'NRT': { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  'SFO': { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA' },
};

function generateMockFlight(
  params: FlightSearchParams,
  index: number
): Flight {
  const airline = mockAirlines[index % mockAirlines.length];
  const origin = mockAirports[params.origin as keyof typeof mockAirports] || mockAirports['NYC'];
  const destination = mockAirports[params.destination as keyof typeof mockAirports] || mockAirports['LAX'];
  
  const basePrice = 200 + (index * 50) + Math.random() * 300;
  const classMultiplier = {
    'economy': 1,
    'premium-economy': 1.5,
    'business': 3,
    'first': 5
  }[params.class];

  const departureTime = new Date(params.departureDate);
  departureTime.setHours(6 + (index * 2) % 18, Math.floor(Math.random() * 60));
  
  const duration = 120 + Math.random() * 480; // 2-10 hours
  const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

  return {
    id: `flight_${index + 1}`,
    segments: [{
      id: `segment_${index + 1}`,
      airline,
      flightNumber: `${airline.code}${1000 + index}`,
      departure: {
        airport: origin,
        time: departureTime.toISOString(),
        terminal: `T${Math.floor(Math.random() * 3) + 1}`,
      },
      arrival: {
        airport: destination,
        time: arrivalTime.toISOString(),
        terminal: `T${Math.floor(Math.random() * 3) + 1}`,
      },
      duration: Math.floor(duration),
      aircraft: 'Boeing 737',
    }],
    price: {
      amount: Math.floor(basePrice * classMultiplier),
      currency: 'USD',
      breakdown: {
        baseFare: Math.floor(basePrice * classMultiplier * 0.8),
        taxes: Math.floor(basePrice * classMultiplier * 0.15),
        fees: Math.floor(basePrice * classMultiplier * 0.05),
      },
    },
    class: params.class,
    availableSeats: Math.floor(Math.random() * 50) + 10,
    totalDuration: Math.floor(duration),
    stops: 0,
    baggage: {
      carry: '1 carry-on bag',
      checked: params.class === 'economy' ? 'Not included' : '1 checked bag',
    },
  };
}

export async function mockFlightSearch(params: FlightSearchParams): Promise<FlightSearchResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const numFlights = Math.floor(Math.random() * 8) + 3; // 3-10 flights
  const flights = Array.from({ length: numFlights }, (_, index) => 
    generateMockFlight(params, index)
  );

  // Sort by price
  flights.sort((a, b) => a.price.amount - b.price.amount);

  return {
    flights,
    searchId: `search_${Date.now()}`,
    totalResults: flights.length,
    searchParams: params,
  };
}

export async function getFlightById(id: string): Promise<Flight | null> {
  // In a real implementation, this would query a database or external API
  // For now, return null as we don't have persistent storage
  return null;
}