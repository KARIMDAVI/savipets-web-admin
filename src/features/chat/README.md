# Chat Organization Feature

## Overview

The Chat Organization feature provides role-based conversation filtering and organization for the admin dashboard. It categorizes conversations into three main types:

- **Admin ↔ Sitter**: Communications between administrators and pet sitters
- **Admin ↔ Owner**: Communications between administrators and pet owners
- **Sitter ↔ Owner**: Direct communications between sitters and owners

## Features

### Category-Based Filtering
- Filter conversations by category using tab navigation
- Real-time count updates per category
- Search works within filtered results

### Visual Indicators
- Color-coded badges for conversation types
- Role badges for participants (Admin, Sitter, Owner)
- Category breakdown in stats cards

### Performance
- Optimized with memoization for large datasets
- Handles 1000+ conversations efficiently (<50ms)
- Real-time updates without performance degradation

## Architecture

### Core Utilities

#### `conversationTypeDetection.ts`
Detects conversation category based on participant roles.

```typescript
import { getConversationCategory } from '@/features/chat/utils/conversationTypeDetection';

const category = getConversationCategory(conversation, users);
// Returns: 'admin-sitter' | 'admin-owner' | 'sitter-owner' | 'unknown'
```

#### `conversationGrouping.ts`
Groups conversations by category and calculates statistics.

```typescript
import { 
  groupConversationsByCategory,
  calculateCategoryStats 
} from '@/features/chat/utils/conversationGrouping';

const grouped = groupConversationsByCategory(conversations, users);
const stats = calculateCategoryStats(conversations, users);
```

#### `conversationFilters.ts`
Filters conversations by category.

```typescript
import { filterByCategory } from '@/features/chat/utils/conversationFilters';

const filtered = filterByCategory(conversations, 'admin-sitter', users);
```

### Components

#### `ConversationTypeBadge`
Displays color-coded badge for conversation category.

```typescript
import { ConversationTypeBadge } from '@/features/chat/components';

<ConversationTypeBadge category="admin-sitter" size="small" />
```

#### `ParticipantRoleBadge`
Displays role badge for users.

```typescript
import { ParticipantRoleBadge } from '@/features/chat/components';

<ParticipantRoleBadge role="admin" size="small" />
```

#### `ConversationTypeFilter`
Filter tabs component for category selection.

```typescript
import { ConversationTypeFilter } from '@/features/chat/components';

<ConversationTypeFilter
  activeFilter={activeCategoryFilter}
  onFilterChange={setActiveCategoryFilter}
  categoryCounts={categoryCounts}
  totalCount={conversations.length}
/>
```

### Hooks

#### `useChat`
Enhanced hook with category organization support.

```typescript
import { useChat } from '@/features/chat/hooks';

const {
  conversations,
  filteredConversations, // Only when feature enabled
  activeCategoryFilter,
  setActiveCategoryFilter,
  categoryStats,
  categoryCounts,
} = useChat(selectedConversationId);
```

## Feature Flag

The feature is controlled by the `CHAT_ORGANIZATION_ENABLED` feature flag:

```typescript
// Enable in environment
VITE_CHAT_ORGANIZATION_ENABLED=true
```

**Default**: `false` (feature disabled for safety)

When disabled:
- All existing functionality works as before
- No breaking changes
- Filter tabs are hidden
- Badges are hidden
- Stats show only totals

## Usage

### Basic Usage

```typescript
import { useChat } from '@/features/chat/hooks';
import { ConversationTypeFilter } from '@/features/chat/components';
import { CHAT_ORGANIZATION_ENABLED } from '@/features/chat/utils/chatFeatureFlags';

function ChatPage() {
  const {
    conversations,
    filteredConversations,
    activeCategoryFilter,
    setActiveCategoryFilter,
    categoryStats,
    categoryCounts,
  } = useChat(selectedConversationId);

  const conversationsToUse = CHAT_ORGANIZATION_ENABLED && filteredConversations
    ? filteredConversations
    : conversations;

  return (
    <>
      {CHAT_ORGANIZATION_ENABLED && (
        <ConversationTypeFilter
          activeFilter={activeCategoryFilter}
          onFilterChange={setActiveCategoryFilter}
          categoryCounts={categoryCounts}
          totalCount={conversations.length}
        />
      )}
      <ConversationsList conversations={conversationsToUse} />
    </>
  );
}
```

## Testing

### Unit Tests
- Utilities: >90% coverage
- Components: >70% coverage
- Hooks: >80% coverage

### Integration Tests
- Full chat flow
- Category filtering
- Real-time updates
- Performance with large datasets

### Run Tests
```bash
npm test -- src/features/chat
npm test -- --coverage src/features/chat
```

## Migration Guide

### Enabling the Feature

1. **Set Environment Variable**
   ```bash
   # .env.local
   VITE_CHAT_ORGANIZATION_ENABLED=true
   ```

2. **Verify Feature Flag**
   ```typescript
   import { CHAT_ORGANIZATION_ENABLED } from '@/features/chat/utils/chatFeatureFlags';
   console.log('Feature enabled:', CHAT_ORGANIZATION_ENABLED);
   ```

3. **Test in Development**
   - Verify filter tabs appear
   - Test category filtering
   - Verify badges display
   - Check stats breakdown

4. **Deploy to Production**
   - Feature is disabled by default
   - Enable via environment variable
   - Monitor for issues
   - Can disable instantly if needed

### Backward Compatibility

The feature is fully backward compatible:
- Existing code works without changes
- Feature flag provides safe fallback
- No database migrations required
- No breaking API changes

## Performance Considerations

- **Memoization**: All category calculations are memoized
- **Efficient Filtering**: O(n) complexity for filtering
- **Large Datasets**: Tested with 1000+ conversations (<50ms)
- **Real-time Updates**: Optimized to prevent unnecessary re-renders

## Security

- **Input Validation**: All user inputs validated
- **XSS Protection**: Script tags and javascript: protocol blocked
- **No Sensitive Data**: No sensitive data in logs
- **Error Handling**: Proper error handling without info leakage

## File Structure

```
src/features/chat/
├── components/
│   ├── ConversationTypeBadge.tsx
│   ├── ParticipantRoleBadge.tsx
│   ├── ConversationTypeFilter.tsx
│   ├── ChatStatsCards.tsx (enhanced)
│   └── ConversationsList.tsx (enhanced)
├── hooks/
│   └── useChat.ts (enhanced)
├── types/
│   └── conversation.types.ts
├── utils/
│   ├── conversationTypeDetection.ts
│   ├── conversationGrouping.ts
│   ├── conversationFilters.ts
│   └── chatFeatureFlags.ts
└── __tests__/
    ├── chat.integration.test.tsx
    └── ...
```

## Troubleshooting

### Filter Tabs Not Showing
- Check feature flag: `CHAT_ORGANIZATION_ENABLED`
- Verify environment variable is set
- Check browser console for errors

### Categories Not Detected
- Ensure conversations have `type` field
- Verify users array includes all participants
- Check participant roles are correct

### Performance Issues
- Check conversation count (should handle 1000+)
- Verify memoization is working
- Check for unnecessary re-renders

## Support

For issues or questions:
1. Check this README
2. Review test files for examples
3. Check feature flag status
4. Review console for errors

