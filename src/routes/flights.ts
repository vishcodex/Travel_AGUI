import express from 'express';
import { mockFlightSearch, getFlightById } from '../services/flightService.js';
import { FlightSearchParams } from '@shared/types/flight.js';

const router = express.Router();

// Search flights endpoint
router.post('/search', async (req, res) => {
  try {
    const searchParams: FlightSearchParams = req.body;

    // Basic validation
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: origin, destination, departureDate' 
      });
    }

    const results = await mockFlightSearch(searchParams);
    res.json(results);
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({ error: 'Failed to search flights' });
  }
});

// Get flight by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await getFlightById(id);
    
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    res.json(flight);
  } catch (error) {
    console.error('Get flight error:', error);
    res.status(500).json({ error: 'Failed to get flight' });
  }
});

export { router as flightRoutes };