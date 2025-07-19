import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { FlightTakeoff, Person, CalendarToday } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchParams, setLoading } from '../store/slices/flightSlice';
import { FlightSearchParams } from '@shared/types/flight';

const Search: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [searchForm, setSearchForm] = useState<FlightSearchParams>({
    origin: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    class: 'economy',
    tripType: 'one-way',
  });

  const popularDestinations = [
    { code: 'NYC', name: 'New York', country: 'USA' },
    { code: 'LAX', name: 'Los Angeles', country: 'USA' },
    { code: 'LHR', name: 'London', country: 'UK' },
    { code: 'CDG', name: 'Paris', country: 'France' },
    { code: 'NRT', name: 'Tokyo', country: 'Japan' },
    { code: 'SFO', name: 'San Francisco', country: 'USA' },
  ];

  const handleInputChange = (field: keyof FlightSearchParams, value: any) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', value: number) => {
    setSearchForm(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, value),
      },
    }));
  };

  const handleSearch = () => {
    if (!searchForm.origin || !searchForm.destination) {
      alert('Please select origin and destination airports');
      return;
    }

    dispatch(setSearchParams(searchForm));
    dispatch(setLoading(true));
    navigate('/results');
  };

  const handleDestinationClick = (destination: any) => {
    if (!searchForm.origin) {
      setSearchForm(prev => ({ ...prev, origin: destination.code }));
    } else {
      setSearchForm(prev => ({ ...prev, destination: destination.code }));
    }
  };

  return (
    <Box>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Search Flights
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Trip Type */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label="One Way"
                  clickable
                  color={searchForm.tripType === 'one-way' ? 'primary' : 'default'}
                  onClick={() => handleInputChange('tripType', 'one-way')}
                />
                <Chip
                  label="Round Trip"
                  clickable
                  color={searchForm.tripType === 'round-trip' ? 'primary' : 'default'}
                  onClick={() => handleInputChange('tripType', 'round-trip')}
                />
              </Box>
            </Grid>

            {/* Origin and Destination */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From"
                value={searchForm.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                placeholder="Origin airport code (e.g., NYC)"
                InputProps={{
                  startAdornment: <FlightTakeoff sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="To"
                value={searchForm.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="Destination airport code (e.g., LAX)"
                InputProps={{
                  startAdornment: <FlightTakeoff sx={{ mr: 1, color: 'action.active', transform: 'rotate(90deg)' }} />,
                }}
              />
            </Grid>

            {/* Dates */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Departure Date"
                value={searchForm.departureDate}
                onChange={(e) => handleInputChange('departureDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            {searchForm.tripType === 'round-trip' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Return Date"
                  value={searchForm.returnDate}
                  onChange={(e) => handleInputChange('returnDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
            )}

            {/* Passengers */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Adults"
                value={searchForm.passengers.adults}
                onChange={(e) => handlePassengerChange('adults', parseInt(e.target.value) || 0)}
                inputProps={{ min: 1, max: 9 }}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Children"
                value={searchForm.passengers.children}
                onChange={(e) => handlePassengerChange('children', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 9 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Infants"
                value={searchForm.passengers.infants}
                onChange={(e) => handlePassengerChange('infants', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 9 }}
              />
            </Grid>

            {/* Class */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Class"
                value={searchForm.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
              >
                <MenuItem value="economy">Economy</MenuItem>
                <MenuItem value="premium-economy">Premium Economy</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="first">First Class</MenuItem>
              </TextField>
            </Grid>

            {/* Search Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                Search Flights
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Popular Destinations */}
        <Typography variant="h6" gutterBottom>
          Popular Destinations
        </Typography>
        <Grid container spacing={2}>
          {popularDestinations.map((destination) => (
            <Grid item xs={6} sm={4} md={2} key={destination.code}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleDestinationClick(destination)}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" component="div">
                    {destination.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {destination.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {destination.country}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
  );
};

export default Search;