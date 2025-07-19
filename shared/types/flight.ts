export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Airline {
  code: string;
  name: string;
  logo?: string;
}

export interface FlightSegment {
  id: string;
  airline: Airline;
  flightNumber: string;
  departure: {
    airport: Airport;
    time: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: Airport;
    time: string;
    terminal?: string;
    gate?: string;
  };
  duration: number; // in minutes
  aircraft?: string;
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  price: {
    amount: number;
    currency: string;
    breakdown?: {
      baseFare: number;
      taxes: number;
      fees: number;
    };
  };
  class: 'economy' | 'premium-economy' | 'business' | 'first';
  availableSeats: number;
  totalDuration: number; // in minutes
  stops: number;
  baggage?: {
    carry: string;
    checked: string;
  };
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  class: 'economy' | 'premium-economy' | 'business' | 'first';
  tripType: 'one-way' | 'round-trip' | 'multi-city';
}

export interface FlightSearchResponse {
  flights: Flight[];
  searchId: string;
  totalResults: number;
  searchParams: FlightSearchParams;
}

export interface FlightSearchResult {
  flights: any[];
  searchId: string;
  totalResults: number;
  searchParams: FlightSearchParams;
  provider?: string;
  timestamp?: string;
  metadata?: any;
}