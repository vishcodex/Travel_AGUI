import { configureStore } from '@reduxjs/toolkit';
import { flightApi } from './api/flightApi';
import flightSlice from './slices/flightSlice';
import agentSlice from './slices/agentSlice';

export const store = configureStore({
  reducer: {
    flight: flightSlice,
    agent: agentSlice,
    [flightApi.reducerPath]: flightApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(flightApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;