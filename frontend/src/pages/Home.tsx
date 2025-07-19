import React from 'react';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { FlightTakeoff, SmartToy, Speed } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SmartToy color="primary" sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Search',
      description: 'Let our intelligent agent help you find the perfect flights with natural conversation.',
    },
    {
      icon: <Speed color="primary" sx={{ fontSize: 40 }} />,
      title: 'Real-time Results',
      description: 'Get instant flight options with live pricing and availability updates.',
    },
    {
      icon: <FlightTakeoff color="primary" sx={{ fontSize: 40 }} />,
      title: 'Easy Booking',
      description: 'Complete your booking seamlessly with our guided step-by-step process.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          borderRadius: 2,
          mb: 6,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Find Your Perfect Flight
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          Chat with our AI assistant to discover and book flights tailored to your needs
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/search')}
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
        >
          Start Your Journey
        </Button>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
        Why Choose Our Flight Assistant?
      </Typography>
      
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CTA Section */}
      <Box sx={{ textAlign: 'center', mt: 8, py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Ready to find your next flight?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Our AI assistant is standing by to help you discover the best travel options.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/search')}
          startIcon={<FlightTakeoff />}
        >
          Search Flights Now
        </Button>
      </Box>
    </Box>
  );
};

export default Home;