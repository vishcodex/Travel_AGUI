import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Message,
  FlightTakeoff,
  CheckCircle,
  Error,
  AutoAwesome,
  Build,
  Input,
  Stop,
  Code,
  Notifications,
} from '@mui/icons-material';

interface LiveEvent {
  id: string;
  type: string;
  message: string;
  status: 'active' | 'completed' | 'error';
  timestamp: number;
  details?: any;
  progress?: number;
}

interface LiveEventStreamProps {
  events: LiveEvent[];
  isStreaming: boolean;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'RUN_STARTED':
      return <PlayArrow color="primary" />;
    case 'RUN_FINISHED':
      return <Stop color="success" />;
    case 'USER_INPUT':
    case 'USER_SEARCH':
      return <Input color="info" />;
    case 'TEXT_MESSAGE_START':
      return <Message color="info" />;
    case 'TEXT_MESSAGE_CONTENT':
      return <AutoAwesome color="secondary" />;
    case 'TEXT_MESSAGE_END':
      return <CheckCircle color="success" />;
    case 'TOOL_CALL_START':
      return <Build color="warning" />;
    case 'TOOL_CALL_ARGS':
      return <Code color="warning" />;
    case 'TOOL_CALL_END':
      return <CheckCircle color="success" />;
    case 'FLIGHT_SEARCH_RESULT':
    case 'CUSTOM':
      return <FlightTakeoff color="primary" />;
    case 'RUN_ERROR':
      return <Error color="error" />;
    default:
      return <Notifications color="action" />;
  }
};

const LiveEventStream: React.FC<LiveEventStreamProps> = ({ events, isStreaming }) => {
  if (events.length === 0 && !isStreaming) {
    return null;
  }

  // Get the most recent event to display
  const currentEvent = events.length > 0 ? events[events.length - 1] : null;

  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          🤖 Agent Status
        </Typography>
        {isStreaming && (
          <Chip 
            label="LIVE" 
            color="error" 
            size="small" 
            sx={{ 
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              }
            }} 
          />
        )}
      </Box>

      {/* Single updating status box */}
      <Card 
        sx={{
          border: 2,
          borderColor: isStreaming ? 'primary.main' : 'success.main',
          bgcolor: isStreaming ? 'primary.50' : 'success.50',
          transition: 'all 0.5s ease',
          minHeight: 120,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ mt: 0.5 }}>
              {currentEvent ? getEventIcon(currentEvent.type) : 
               isStreaming ? <AutoAwesome color="primary" /> : <CheckCircle color="success" />}
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'medium',
                mb: 1,
                color: isStreaming ? 'primary.main' : 'success.main'
              }}>
                {currentEvent ? currentEvent.message : 
                 isStreaming ? 'Initializing agent...' : 'Ready'}
              </Typography>
              
              {/* Details */}
              {currentEvent?.details && (
                <Typography variant="body2" color="text.secondary" sx={{ 
                  bgcolor: 'rgba(255,255,255,0.7)', 
                  p: 1, 
                  borderRadius: 1, 
                  fontSize: '0.85rem',
                  mb: 1,
                  fontFamily: 'monospace'
                }}>
                  {currentEvent.details}
                </Typography>
              )}
              
              {/* Activity indicator when streaming */}
              {isStreaming && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    sx={{ 
                      height: 4, 
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.3)',
                    }} 
                  />
                </Box>
              )}
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {currentEvent ? `Last updated: ${new Date(currentEvent.timestamp).toLocaleTimeString()}` : 
                 isStreaming ? 'Processing...' : 'Idle'}
              </Typography>
            </Box>
            
            <Chip 
              label={isStreaming ? 'ACTIVE' : 'COMPLETE'} 
              size="small" 
              color={isStreaming ? 'primary' : 'success'}
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default LiveEventStream;