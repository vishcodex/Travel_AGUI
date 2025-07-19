import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useAgentChat } from '../hooks/useAgentChat';
import LiveEventStream from '../components/LiveEventStream';

const Results: React.FC = () => {
  const { searchParams, loading } = useSelector((state: RootState) => state.flight);
  const { messages, isStreaming, liveEvents } = useSelector((state: RootState) => state.agent);
  const { sendMessage } = useAgentChat();

  useEffect(() => {
    // When component mounts, trigger flight search if we have search params
    if (searchParams && !messages.length) {
      const threadId = `search-${Date.now()}`;
      const runId = `run-${Date.now()}`;
      
      sendMessage({
        threadId,
        runId,
        searchParams,
      });
    }
  }, [searchParams, sendMessage, messages.length]);

  if (!searchParams) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          No search parameters found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please go back and search for flights.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Flight Search Results
      </Typography>
      
      {/* Search Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={`${searchParams.origin} → ${searchParams.destination}`} color="primary" />
          <Chip label={searchParams.departureDate} />
          <Chip label={`${searchParams.passengers.adults} adult(s)`} />
          <Chip label={searchParams.class} />
          <Chip label={searchParams.tripType} />
        </Box>
      </Paper>

      {/* Live Event Stream */}
      <LiveEventStream events={liveEvents} isStreaming={isStreaming} />

      {/* Agent Conversation */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          AI Assistant
        </Typography>
        
        {messages.length === 0 && (isStreaming || loading) && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Our AI agent is searching for flights...
            </Typography>
          </Box>
        )}

        {messages.map((message, index) => (
          <Card 
            key={message.id} 
            sx={{ 
              mb: 2, 
              bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
              color: message.role === 'user' ? 'primary.contrastText' : 'text.primary'
            }}
          >
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                {message.content}
                {isStreaming && index === messages.length - 1 && message.role === 'assistant' && (
                  <Box component="span" sx={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '16px', 
                    bgcolor: 'text.primary',
                    ml: 0.5,
                    animation: 'blink 1s infinite'
                  }} />
                )}
              </Typography>
            </CardContent>
          </Card>
        ))}

        {isStreaming && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              AI is responding...
            </Typography>
          </Box>
        )}
      </Paper>

      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
};

export default Results;