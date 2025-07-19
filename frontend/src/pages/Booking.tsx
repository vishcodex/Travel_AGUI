import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Booking: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Complete Your Booking
      </Typography>
      <Paper sx={{ p: 4 }}>
        <Typography variant="body1">
          Booking functionality will be implemented in the next phase.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Booking;