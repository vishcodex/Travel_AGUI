import express from 'express';
import { EventType } from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';
import { 
  liveFlightSearchTool,
  weatherFlightSearchTool,
  historicalFlightSearchTool,
  enhancedFlightSearchTool
} from '../agents/flightSearchAgent.js';

const router = express.Router();
const encoder = new EventEncoder();

// Test endpoint for Live Flight Search (OpenSky)
router.post('/live-flights', async (req, res) => {
  try {
    const { searchParams } = req.body;
    
    console.log('🧪 Testing Live Flight Search Tool (OpenSky API)');
    
    const result = await liveFlightSearchTool.execute({
      context: {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate,
        passengers: searchParams.passengers,
        class: searchParams.class,
        tripType: searchParams.tripType,
      }
    });
    
    res.json({
      tool: 'Live Flight Search (OpenSky)',
      dataType: 'Real-time + Mock',
      result
    });
  } catch (error) {
    console.error('Live flight test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for Weather Flight Search
router.post('/weather-flights', async (req, res) => {
  try {
    const { searchParams } = req.body;
    
    console.log('🧪 Testing Weather Flight Search Tool (Weather API)');
    
    const result = await weatherFlightSearchTool.execute({
      context: {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate,
        passengers: searchParams.passengers,
        class: searchParams.class,
        tripType: searchParams.tripType,
      }
    });
    
    res.json({
      tool: 'Weather Flight Search',
      dataType: 'Real Weather + Mock Flights',
      result
    });
  } catch (error) {
    console.error('Weather flight test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for Historical Flight Search
router.post('/historical-flights', async (req, res) => {
  try {
    const { searchParams } = req.body;
    
    console.log('🧪 Testing Historical Flight Search Tool');
    
    const result = await historicalFlightSearchTool.execute({
      context: {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate,
        passengers: searchParams.passengers,
        class: searchParams.class,
        tripType: searchParams.tripType,
      }
    });
    
    res.json({
      tool: 'Historical Flight Search',
      dataType: 'Mock Historical Data',
      result
    });
  } catch (error) {
    console.error('Historical flight test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for Enhanced Mock Flight Search
router.post('/enhanced-flights', async (req, res) => {
  try {
    const { searchParams } = req.body;
    
    console.log('🧪 Testing Enhanced Mock Flight Search Tool');
    
    const result = await enhancedFlightSearchTool.execute({
      context: {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate,
        passengers: searchParams.passengers,
        class: searchParams.class,
        tripType: searchParams.tripType,
      }
    });
    
    res.json({
      tool: 'Enhanced Mock Flight Search',
      dataType: 'Enhanced Mock Data',
      result
    });
  } catch (error) {
    console.error('Enhanced flight test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test all tools at once
router.post('/all-tools', async (req, res) => {
  try {
    const { searchParams } = req.body;
    
    console.log('🧪 Testing ALL Flight Search Tools');
    
    const context = {
      origin: searchParams.origin,
      destination: searchParams.destination,
      departureDate: searchParams.departureDate,
      returnDate: searchParams.returnDate,
      passengers: searchParams.passengers,
      class: searchParams.class,
      tripType: searchParams.tripType,
    };
    
    const results = await Promise.allSettled([
      liveFlightSearchTool.execute({ context }),
      weatherFlightSearchTool.execute({ context }),
      historicalFlightSearchTool.execute({ context }),
      enhancedFlightSearchTool.execute({ context })
    ]);
    
    const toolResults = [
      { name: 'Live Flight Search (OpenSky)', dataType: 'Real-time + Mock', result: results[0] },
      { name: 'Weather Flight Search', dataType: 'Real Weather + Mock Flights', result: results[1] },
      { name: 'Historical Flight Search', dataType: 'Mock Historical Data', result: results[2] },
      { name: 'Enhanced Mock Flight Search', dataType: 'Enhanced Mock Data', result: results[3] }
    ];
    
    res.json({
      message: 'All tools tested',
      tools: toolResults.map(tool => ({
        name: tool.name,
        dataType: tool.dataType,
        status: tool.result.status,
        flightCount: tool.result.status === 'fulfilled' ? tool.result.value.flights.length : 0,
        provider: tool.result.status === 'fulfilled' ? tool.result.value.provider : 'Error',
        error: tool.result.status === 'rejected' ? tool.result.reason.message : null
      }))
    });
  } catch (error) {
    console.error('All tools test error:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as testRoutes };