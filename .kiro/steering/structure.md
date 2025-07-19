# Project Structure

## Root Level Organization
```
/
├── .git/                 # Git version control
├── .gitignore           # Git ignore patterns
├── .kiro/               # Kiro AI assistant configuration
│   └── steering/        # AI guidance documents
└── ui_experiment/       # Flight booking application workspace
    ├── frontend/         # React TypeScript frontend
    ├── backend/          # Mastra agent backend
    ├── shared/           # Shared types and utilities
    └── docs/             # Project documentation
```

## Frontend Structure (`/ui_experiment/frontend/`)
```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Generic components (Button, Input, etc.)
│   │   ├── flight/      # Flight-specific components
│   │   └── booking/     # Booking flow components
│   ├── pages/           # Route-level page components
│   │   ├── Home/        # Landing page
│   │   ├── Search/      # Flight search interface
│   │   ├── Results/     # Search results display
│   │   └── Booking/     # Booking confirmation
│   ├── store/           # Redux store configuration
│   │   ├── slices/      # Redux Toolkit slices
│   │   └── api/         # RTK Query API definitions
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── theme/           # Material-UI theme configuration
├── package.json
└── vite.config.ts
```

## Backend Structure (`/ui_experiment/backend/`)
```
backend/
├── src/
│   ├── agents/          # Mastra agent definitions
│   │   ├── flight-search.ts    # Flight search agent
│   │   ├── booking.ts          # Booking process agent
│   │   └── customer-service.ts # Support agent
│   ├── tools/           # Agent tools and functions
│   │   ├── flight-api.ts       # Flight data integration
│   │   ├── payment.ts          # Payment processing
│   │   └── notifications.ts    # Email/SMS notifications
│   ├── routes/          # Express route handlers
│   ├── middleware/      # Custom middleware
│   ├── config/          # Configuration files
│   └── utils/           # Backend utilities
├── package.json
└── tsconfig.json
```

## Shared Structure (`/ui_experiment/shared/`)
```
shared/
├── types/               # Common TypeScript interfaces
│   ├── flight.ts        # Flight data structures
│   ├── booking.ts       # Booking-related types
│   └── agent.ts         # AG-UI protocol types
├── constants/           # Shared constants
└── utils/               # Cross-platform utilities
```

## Key Architectural Patterns

### Component Organization
- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **Feature-based**: Group related components, hooks, and utilities together
- **Barrel Exports**: Use index.ts files for clean imports

### State Management
- **Redux Slices**: Separate slices for flights, booking, user, and agent state
- **RTK Query**: API state management with caching and invalidation
- **AG-UI Integration**: Agent state synchronized with Redux store

### Agent Architecture
- **Mastra Workflows**: Define multi-step booking processes
- **Tool Integration**: Connect to external APIs (flight data, payment)
- **Event Streaming**: Real-time updates via AG-UI protocol

### Development Workflow
1. **Frontend Development**: Start with UI components and mock data
2. **Backend Integration**: Implement Mastra agents with real APIs
3. **AG-UI Connection**: Connect frontend to streaming agent responses
4. **Testing**: Unit tests for components, integration tests for agents
5. **Deployment**: Separate deployments for frontend and backend services

## File Naming Conventions
- **Components**: PascalCase (e.g., `FlightCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useFlightSearch.ts`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Types**: PascalCase with descriptive names (e.g., `FlightSearchParams.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)