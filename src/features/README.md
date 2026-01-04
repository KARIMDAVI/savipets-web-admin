# Features Module

This directory contains feature-based code organization. Each feature is self-contained with its own components, hooks, stores, types, and utilities.

## Structure

```
features/
├── bookings/              # Bookings feature
│   ├── components/        # Booking-specific components
│   ├── hooks/             # Booking-specific hooks
│   ├── stores/            # Zustand stores for bookings
│   ├── types/             # Booking-specific types
│   ├── utils/             # Booking-specific utilities
│   └── index.ts           # Barrel export
├── system-config/         # System configuration feature
├── notifications/         # Notifications feature
└── index.ts               # Main barrel export
```

## Feature Structure Template

Each feature should follow this structure:

```
feature-name/
├── components/            # Feature components (<300 lines each)
│   └── index.ts
├── hooks/                 # Custom hooks (<200 lines each)
│   └── index.ts
├── stores/                # Zustand stores (<250 lines each)
│   └── index.ts
├── types/                 # Feature-specific types
│   └── index.ts
├── utils/                 # Feature-specific utilities (<200 lines each)
│   └── index.ts
└── index.ts               # Main barrel export
```

## Usage

```typescript
// Import from feature module
import { BookingViewMode } from '@/features/bookings';
import { useBookings } from '@/features/bookings/hooks';
import { BookingTable } from '@/features/bookings/components';
```

## Guidelines

- **Each feature is self-contained**
- **Co-locate related code** (components, hooks, types together)
- **Use barrel exports** for clean imports
- **Keep files under size limits** (see refactoring plan)
- **Only import from shared/** for cross-feature code

