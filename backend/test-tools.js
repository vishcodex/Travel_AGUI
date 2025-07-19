#!/usr/bin/env node

// Simple test script to test all flight search tools
const API_BASE = 'http://localhost:3001/api/test';

const testParams = {
  searchParams: {
    origin: 'NYC',
    destination: 'SFO',
    departureDate: '2025-07-20',
    returnDate: null,
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    class: 'economy',
    tripType: 'one-way'
  }
};

async function testTool(toolName, endpoint) {
  console.log(`\n🧪 Testing ${toolName}...`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testParams)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ ${toolName} - SUCCESS`);
    console.log(`📊 Tool: ${data.tool}`);
    console.log(`📈 Data Type: ${data.dataType}`);
    console.log(`✈️  Flights Found: ${data.result.flights.length}`);
    console.log(`🏢 Provider: ${data.result.provider}`);
    console.log(`📝 Summary: ${data.result.summary}`);
    
    // Show first flight details
    if (data.result.flights.length > 0) {
      const flight = data.result.flights[0];
      console.log(`\n🛫 Sample Flight:`);
      console.log(`   Flight: ${flight.flightNumber || flight.id}`);
      console.log(`   Airline: ${flight.airline?.name || 'Unknown'}`);
      console.log(`   Price: $${flight.price?.amount || 'N/A'}`);
      
      // Show real-time data if available
      if (flight.liveData) {
        console.log(`   🔴 LIVE DATA:`);
        console.log(`     Altitude: ${flight.liveData.altitude} ft`);
        console.log(`     Speed: ${flight.liveData.speed} mph`);
        console.log(`     Status: ${flight.liveData.status}`);
        console.log(`     Source: ${flight.liveData.realTimeSource}`);
      }
      
      // Show weather data if available
      if (flight.weatherImpact) {
        console.log(`   🌤️  WEATHER DATA:`);
        console.log(`     Origin: ${flight.weatherImpact.origin.condition}, ${flight.weatherImpact.origin.temperature}°C`);
        console.log(`     Destination: ${flight.weatherImpact.destination.condition}, ${flight.weatherImpact.destination.temperature}°C`);
      }
      
      // Show historical data if available
      if (flight.historicalData) {
        console.log(`   📊 HISTORICAL DATA:`);
        console.log(`     On-time: ${flight.historicalData.onTimePerformance}%`);
        console.log(`     Avg Delay: ${flight.historicalData.averageDelay} min`);
      }
    }
    
  } catch (error) {
    console.log(`❌ ${toolName} - FAILED`);
    console.log(`   Error: ${error.message}`);
  }
}

async function testAllTools() {
  console.log('🚀 Flight Search Tools Testing Suite');
  console.log('====================================');
  
  // Test individual tools
  await testTool('Live Flight Search (OpenSky)', '/live-flights');
  await testTool('Weather Flight Search', '/weather-flights');
  await testTool('Historical Flight Search', '/historical-flights');
  await testTool('Enhanced Mock Flight Search', '/enhanced-flights');
  
  // Test all tools at once
  console.log(`\n🧪 Testing ALL TOOLS AT ONCE...`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${API_BASE}/all-tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testParams)
    });
    
    const data = await response.json();
    
    console.log(`✅ All Tools Test - SUCCESS`);
    console.log(`\n📊 Summary:`);
    data.tools.forEach(tool => {
      const status = tool.status === 'fulfilled' ? '✅' : '❌';
      console.log(`   ${status} ${tool.name}: ${tool.flightCount} flights (${tool.dataType})`);
      if (tool.error) {
        console.log(`      Error: ${tool.error}`);
      }
    });
    
  } catch (error) {
    console.log(`❌ All Tools Test - FAILED`);
    console.log(`   Error: ${error.message}`);
  }
  
  console.log(`\n🎯 Testing Complete!`);
  console.log(`\nTo test via frontend, use different search terms:`);
  console.log(`- "real-time flights" → should use Live Flight Search`);
  console.log(`- "weather conditions" → should use Weather Flight Search`);
  console.log(`- "historical data" → should use Historical Flight Search`);
  console.log(`- "general search" → should use Enhanced Mock Search`);
}

// Run the tests
testAllTools().catch(console.error);