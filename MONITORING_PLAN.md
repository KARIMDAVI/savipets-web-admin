# File Growth Monitoring Plan

**Date Created:** January 2025  
**Purpose:** Monitor files that are approaching the 400-line limit and may need refactoring in the future

---

## 📊 Monitored Files

### 1. Dashboard.tsx
- **Current Size:** 290 lines
- **Status:** ⚠️ MONITORING
- **Location:** `src/pages/Dashboard.tsx`
- **Risk Level:** Medium-High
- **Reason:** Dashboard pages typically grow as new features/metrics are added

#### Current Structure Analysis
- **React Hooks:** 3 useQuery hooks (users, bookings, notifications)
- **State Management:** Minimal local state
- **Components:** Inline components (Statistic cards, Activity list)
- **Utilities:** Inline `formatTimeAgo` function
- **Complexity:** Medium

#### Refactoring Recommendations (When >350 lines)
1. **Extract Statistics Cards** → `features/dashboard/components/DashboardStatsCards.tsx`
2. **Extract Activity List** → `features/dashboard/components/RecentActivityList.tsx`
3. **Extract Utilities** → `features/dashboard/utils/dashboardHelpers.ts`
   - `formatTimeAgo` function
   - `getStatusIcon` function
   - Statistics calculation logic
4. **Create Hook** → `features/dashboard/hooks/useDashboard.ts`
   - Consolidate data fetching
   - Statistics calculation

#### Growth Triggers
- Adding new metric cards (+20-30 lines each)
- Adding new activity types (+15-20 lines each)
- Adding filters or search (+30-50 lines)
- Adding export functionality (+20-30 lines)

#### Action Threshold
- **Refactor When:** File exceeds 350 lines
- **Priority:** Medium
- **Estimated Refactoring Time:** 2-3 hours

---

### 2. Users.tsx
- **Current Size:** 285 lines
- **Status:** ⚠️ MONITORING
- **Location:** `src/pages/Users.tsx`
- **Risk Level:** Medium-High
- **Reason:** User management pages often expand with new features

#### Current Structure Analysis
- **React Hooks:** 1 useQuery hook, 7 useState hooks
- **State Management:** Multiple modal visibility states
- **Components:** Already has some extracted components:
  - `UserStatsCards`
  - `UserFiltersBar`
  - `UserTable`
  - `UserDetailModal`
- **Handlers:** 8+ handler functions (inline)
- **Complexity:** Medium-High

#### Refactoring Recommendations (When >350 lines)
1. **Extract Actions Hook** → `features/users/hooks/useUserActions.ts`
   - `handleToggleUserStatus`
   - `handleRoleChange`
   - `handleSitterMessagingToggle`
   - `handleCreateUser`
   - `handleDeleteUser`
2. **Extract Utilities** → `features/users/utils/userHelpers.ts`
   - `exportUsers` function
   - Filter logic
3. **Create Store (if needed)** → `features/users/stores/useUserStore.ts`
   - Consolidate modal visibility states
   - Filter state management

#### Growth Triggers
- Adding bulk actions (+30-50 lines)
- Adding advanced filters (+20-30 lines)
- Adding user import/export (+40-60 lines)
- Adding user activity history (+30-50 lines)
- Adding user permissions management (+50-80 lines)

#### Action Threshold
- **Refactor When:** File exceeds 350 lines
- **Priority:** Medium
- **Estimated Refactoring Time:** 3-4 hours

---

### 3. chat.service.ts
- **Current Size:** 321 lines
- **Status:** ⚠️ MONITORING (Close to threshold)
- **Location:** `src/services/chat.service.ts`
- **Risk Level:** Medium
- **Reason:** Service files can grow quickly with new features

#### Current Structure Analysis
- **Methods:** 10 async methods
- **Complexity:** Medium
- **Code Organization:** Well-structured class
- **Duplication:** Some repeated transformation logic

#### Refactoring Recommendations (When >350 lines)
1. **Extract Transformers** → `services/chat/utils/chatTransformers.ts`
   - `docToConversation` - Transform Firestore doc to Conversation
   - `docToMessage` - Transform Firestore doc to Message
   - Handle iOS/web format differences
2. **Extract Query Builders** → `services/chat/utils/chatQueryBuilders.ts`
   - Build conversation queries
   - Build message queries
   - Build search queries
3. **Split Service** (if >500 lines):
   - `chat-query.service.ts` - Read operations
   - `chat-mutation.service.ts` - Write operations

#### Growth Triggers
- Adding message reactions (+30-40 lines)
- Adding message editing/deletion (+40-60 lines)
- Adding conversation archiving (+30-40 lines)
- Adding message search/filtering (+40-60 lines)
- Adding typing indicators (+30-40 lines)
- Adding file attachments handling (+50-80 lines)

#### Action Threshold
- **Refactor When:** File exceeds 350 lines
- **Priority:** Medium
- **Estimated Refactoring Time:** 2-3 hours

---

## 📈 Monitoring Strategy

### Regular Checks
1. **Weekly Review:** Check file sizes during code reviews
2. **Pre-Commit Hook:** Alert if monitored files exceed thresholds
3. **Monthly Audit:** Review all monitored files and update this document

### Growth Tracking
Track these metrics for each monitored file:
- **Line Count:** Current vs. previous month
- **Complexity:** Number of hooks, handlers, components
- **Dependencies:** Number of imports and external dependencies
- **Code Smells:** Duplication, long functions, complex conditionals

### Alert Thresholds
- **Yellow Alert:** File exceeds 300 lines
- **Orange Alert:** File exceeds 350 lines (prepare refactoring)
- **Red Alert:** File exceeds 400 lines (refactor immediately)

---

## 🔍 Code Quality Indicators

### Signs That Refactoring Is Needed

#### Dashboard.tsx
- ✅ Currently: Well-structured, minimal duplication
- ⚠️ Watch for: Inline component definitions, repeated calculation logic
- ⚠️ Watch for: Multiple useQuery hooks without consolidation

#### Users.tsx
- ✅ Currently: Good component extraction already done
- ⚠️ Watch for: Growing number of handler functions
- ⚠️ Watch for: Multiple modal states (consider Zustand store)
- ⚠️ Watch for: Complex filter logic

#### chat.service.ts
- ✅ Currently: Clean class structure
- ⚠️ Watch for: Repeated transformation logic
- ⚠️ Watch for: Growing number of methods (>15 methods)
- ⚠️ Watch for: Complex query building logic

---

## 📝 Refactoring Checklist (When Threshold Reached)

### Before Refactoring
- [ ] Document current functionality
- [ ] Write/update tests
- [ ] Create feature branch
- [ ] Set up feature flag (if needed)

### During Refactoring
- [ ] Extract utilities first
- [ ] Extract hooks/services
- [ ] Extract components
- [ ] Update main file
- [ ] Run tests after each step

### After Refactoring
- [ ] All tests passing
- [ ] Build successful
- [ ] Code review completed
- [ ] Documentation updated
- [ ] File size <400 lines

---

## 📅 Review Schedule

### Monthly Review (First Monday of Each Month)
1. Check current line counts
2. Review code complexity
3. Update this document
4. Plan refactoring if needed

### Quarterly Review (Every 3 Months)
1. Comprehensive analysis of all monitored files
2. Review growth trends
3. Update monitoring thresholds if needed
4. Add/remove files from monitoring list

---

## 🎯 Success Metrics

### Monitoring Success
- ✅ No files exceed 400 lines unexpectedly
- ✅ Refactoring happens proactively (at 350 lines)
- ✅ Code quality maintained
- ✅ Technical debt minimized

### Refactoring Success (When Applied)
- ✅ File reduced to <300 lines
- ✅ Code organization improved
- ✅ Test coverage maintained or improved
- ✅ No functionality lost
- ✅ Performance maintained or improved

---

**Last Updated:** January 2025  
**Next Review:** February 2025  
**Maintained By:** Development Team






