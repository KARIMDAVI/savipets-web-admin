# Shared Module

This directory contains code shared across multiple features.

## Structure

```
shared/
├── utils/          # Shared utility functions
│   ├── formatters.ts    # Formatting functions (currency, dates, names)
│   ├── constants.ts     # Shared constants
│   └── index.ts         # Barrel export
├── types/          # Shared type definitions
│   └── index.ts         # Re-exports common types
├── components/     # Shared React components
│   └── index.ts         # Barrel export
└── index.ts        # Main barrel export
```

## Usage

```typescript
// Import from shared module
import { formatCurrency, formatTimeAgo } from '@/shared/utils';
import { BOOKING_STATUSES } from '@/shared/utils/constants';
import { ErrorBoundary } from '@/shared/components';
```

## Guidelines

- **Only add code here if it's used by 2+ features**
- **Keep utilities pure functions when possible**
- **All utilities must be typed with TypeScript**
- **Add tests for all utilities**

