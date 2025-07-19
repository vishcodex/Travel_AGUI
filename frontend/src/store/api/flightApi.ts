import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FlightSearchParams, FlightSearchResponse } from '@shared/types/flight';
import { BookingRequest, Booking } from '@shared/types/booking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const flightApi = createApi({
  reducerPath: 'flightApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
  }),
  tagTypes: ['Flight', 'Booking'],
  endpoints: (builder) => ({
    searchFlights: builder.query<FlightSearchResponse, FlightSearchParams>({
      query: (params) => ({
        url: '/flights/search',
        method: 'POST',
        body: params,
      }),
      providesTags: ['Flight'],
    }),
    getFlightById: builder.query<any, string>({
      query: (id) => `/flights/${id}`,
      providesTags: ['Flight'],
    }),
    createBooking: builder.mutation<Booking, BookingRequest>({
      query: (booking) => ({
        url: '/bookings',
        method: 'POST',
        body: booking,
      }),
      invalidatesTags: ['Booking'],
    }),
    getBooking: builder.query<Booking, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: ['Booking'],
    }),
  }),
});

export const {
  useSearchFlightsQuery,
  useLazySearchFlightsQuery,
  useGetFlightByIdQuery,
  useCreateBookingMutation,
  useGetBookingQuery,
} = flightApi;