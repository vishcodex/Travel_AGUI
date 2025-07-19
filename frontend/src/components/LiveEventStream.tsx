import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  RadioButtonUnchecked,
  CheckCircleOutline,
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
    case 'THINKING_START':
    case 'THINKING_TEXT_MESSAGE_CONTENT':
    case 'THINKING_END':
      return <AutoAwesome color="secondary" />;
    case 'STEP_STARTED':
      return <PlayArrow color="primary" />;
    case 'STEP_FINISHED':
      return <CheckCircle color="success" />;
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
    case 'TOOL_CALL_RESULT':
      return <Notifications color="info" />;
    case 'TOOL_CALL_END':
      return <CheckCircle color="success" />;
    case 'STATE_SNAPSHOT':
    case 'STATE_DELTA':
    case 'MESSAGES_SNAPSHOT':
      return <Notifications color="info" />;
    case 'FLIGHT_SEARCH_RESULT':
    case 'CUSTOM':
      return <FlightTakeoff color="primary" />;
    case 'RAW':
      return <Code color="action" />;
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

  // Filter to show only important events (not character streaming)
  const importantEvents = events.filter(event =>
    !['TEXT_MESSAGE_CONTENT'].includes(event.type)
  );

  // Define the expected workflow steps
  const workflowSteps = [
    { type: 'USER_INPUT', label: 'Received user request', icon: <Input /> },
    { type: 'USER_SEARCH', label: 'Processing search parameters', icon: <Input /> },
    { type: 'RUN_STARTED', label: 'Agent run started', icon: <PlayArrow /> },
    { type: 'THINKING_START', label: 'Agent analyzing request', icon: <AutoAwesome /> },
    { type: 'STEP_STARTED', label: 'Starting analysis step', icon: <PlayArrow /> },
    { type: 'TEXT_MESSAGE_START', label: 'Composing response', icon: <Message /> },
    { type: 'TOOL_CALL_START', label: 'Calling flight search tool', icon: <Build /> },
    { type: 'TOOL_CALL_ARGS', label: 'Processing search arguments', icon: <Code /> },
    { type: 'TOOL_CALL_RESULT', label: 'Tool result received', icon: <Notifications /> },
    { type: 'TOOL_CALL_END', label: 'Tool execution completed', icon: <CheckCircle /> },
    { type: 'CUSTOM', label: 'Flight search results found', icon: <FlightTakeoff /> },
    { type: 'STATE_SNAPSHOT', label: 'State captured', icon: <Notifications /> },
    { type: 'TEXT_MESSAGE_END', label: 'Response completed', icon: <CheckCircle /> },
    { type: 'STEP_FINISHED', label: 'Analysis step completed', icon: <CheckCircle /> },
    { type: 'RUN_FINISHED', label: 'Agent run completed', icon: <Stop /> },
  ];

  // Create a map of completed events by type
  const completedEventTypes = new Set(importantEvents.map(event => event.type));
  const eventsByType = importantEvents.reduce((acc, event) => {
    acc[event.type] = event;
    return acc;
  }, {} as Record<string, any>);

  // Get current active step
  const currentEvent = importantEvents.length > 0 ? importantEvents[importantEvents.length - 1] : null;

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

      {/* Progressive Checklist */}
      <Card sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
            Flight Search Progress
          </Typography>

          <List dense sx={{ py: 0 }}>
            {workflowSteps.map((step, index) => {
              const isCompleted = completedEventTypes.has(step.type);
              const isCurrent = currentEvent?.type === step.type;
              const event = eventsByType[step.type];

              return (
                <ListItem
                  key={step.type}
                  sx={{
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: isCurrent ? 'primary.50' : 'transparent',
                    transition: 'all 0.3s ease',
                    opacity: isCompleted ? 1 : (isCurrent ? 1 : 0.6),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {isCompleted ? (
                      <CheckCircleOutline
                        sx={{
                          color: 'success.main',
                          fontSize: 20,
                          animation: isCompleted && isCurrent ? 'checkmark 0.5s ease' : 'none',
                          '@keyframes checkmark': {
                            '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)', opacity: 1 },
                          }
                        }}
                      />
                    ) : isCurrent ? (
                      <Box sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: 2,
                        borderColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                          '100%': { transform: 'scale(1)', opacity: 1 },
                        }
                      }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main'
                        }} />
                      </Box>
                    ) : (
                      <RadioButtonUnchecked sx={{ color: 'grey.400', fontSize: 20 }} />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isCurrent ? 'medium' : 'normal',
                          color: isCompleted ? 'text.primary' : (isCurrent ? 'primary.main' : 'text.secondary'),
                          textDecoration: isCompleted ? 'none' : 'none'
                        }}
                      >
                        {event?.message || step.label}
                      </Typography>
                    }
                    secondary={
                      event?.details && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}
                        >
                          {event.details}
                        </Typography>
                      )
                    }
                  />

                  {event && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </Typography>
                  )}
                </ListItem>
              );
            })}
          </List>

          {/* Overall Progress Bar */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Progress: {completedEventTypes.size} of {workflowSteps.length} steps
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round((completedEventTypes.size / workflowSteps.length) * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(completedEventTypes.size / workflowSteps.length) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: isStreaming ? 'primary.main' : 'success.main'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default LiveEventStream;