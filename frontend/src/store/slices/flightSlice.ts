import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlightSearchParams, FlightSearchResponse, Flight } from '@shared/types/flight';

interface FlightState {
  searchParams: FlightSearchParams | null;
  searchResults: FlightSearchResponse | null;
  selectedFlight: Flight | null;
  loading: boolean;
  error: string | null;
}

const initialState: FlightState = {
  searchParams: null,
  searchResults: null,
  selectedFlight: null,
  loading: false,
  error: null,
};

const flightSlice = createSlice({
  name: 'flight',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<FlightSearchParams>) => {
      state.searchParams = action.payload;
      state.error = null;
    },
    setSearchResults: (state, action: PayloadAction<FlightSearchResponse>) => {
      state.searchResults = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedFlight: (state, action: PayloadAction<Flight>) => {
      state.selectedFlight = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSearch: (state) => {
      state.searchResults = null;
      state.selectedFlight = null;
      state.error = null;
    },
  },
});

export const {
  setSearchParams,
  setSearchResults,
  setSelectedFlight,
  setLoading,
  setError,
  clearError,
  resetSearch,
} = flightSlice.actions;

export default flightSlice.reducer;