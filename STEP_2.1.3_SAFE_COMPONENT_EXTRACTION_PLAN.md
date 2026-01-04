# Step 2.1.3: Safe Component Extraction Plan

## Current Status ✅

- ✅ Step 2.1.1: Zustand Store - COMPLETE (18 tests passing)
- ✅ Step 2.1.2: Custom Hooks - COMPLETE (hooks created)
- ⚠️ **CRITICAL:** Hooks NOT integrated into Bookings.tsx yet
- ⏳ Step 2.1.3: Extract Components - **NOT READY YET**

---

## 🚨 CRITICAL ISSUE FOUND

**Bookings.tsx is still using old code patterns:**
- ❌ Still using inline `useQuery` instead of `useBookings` hook
- ❌ Still using inline mutations instead of `useBookingActions` hook
- ❌ Still using `useState` instead of Zustand store
- ❌ Still using inline `getUserName`/`getUserInitials` instead of `useUserMap` hook
- ❌ Still using duplicate `allUsers` query instead of `useUserMap` hook
- ⚠️ Utilities (`formatCurrency`, `extractPetNames`) already extracted to `shared/utils/formatters.ts` - need to verify imports

**⚠️ DO NOT extract components until hooks are integrated!**

---

## 🎯 Corrected Approach: Integration First, Then Extraction

### Phase 0: Integrate Hooks into Bookings.tsx (CRITICAL) 🔴 **DO THIS FIRST**

**Goal:** Replace old code patterns with new hooks/store BEFORE extracting components

**Why Critical:**
- Components will depend on hooks/store
- Can't extract components that use old patterns
- Need to verify integration works before component extraction

**⚠️ IMPORTANT:** This phase uses **parallel implementation pattern** (per WEB_ADMIN_REFACTORING_PLAN.md):
- Keep old code as `BookingsPageLegacy.tsx`
- Create new code as `BookingsPageRefactored.tsx`
- Main `Bookings.tsx` switches between them via feature flag

**Steps:**

#### Step 0.1: Remove Inline Utilities (15 min) ⭐ **DO FIRST**

**Why First:** Simplest change, no dependencies, reduces code immediately.

**⚠️ IMPORTANT NOTE:** The `extractPetNames` in `formatters.ts` is more complete than the inline version:
- **Bookings.tsx version:** Handles objects via `Object.values(petsData)` (iterates all values in object)
- **formatters.ts version:** Handles comma-separated strings (new feature) AND objects via `pushName(petsData)` (checks for name/petName keys)
- The formatters version is better and more complete, but we need to verify it handles all cases Bookings.tsx was handling
- **If testing reveals issues with object handling**, we may need to update formatters.ts to also handle `Object.values()` case, but test first to confirm
**Data Format Context:**
- `User.pets` is typed as `Pet[]` (array of Pet objects with `name` field)
- Both versions handle arrays correctly
- Bookings.tsx version also handles object maps: `{pet1: Pet, pet2: Pet}`
- Test with actual Firestore data to verify all formats are handled
**Tasks:**
1. Remove `formatCurrency` from Bookings.tsx (lines 67-74)
2. Remove `extractPetNames` from Bookings.tsx (lines 76-116)
3. Add import: `import { formatCurrency, extractPetNames } from '@/shared/utils/formatters'`
4. **Test: Verify formatting still works:**
   - Currency displays correctly (test with various values: 0, null, undefined, strings, numbers)
   - Pet names extract correctly - **CRITICAL:** Test all cases:
     - Arrays of pet objects: `[{name: "Fluffy"}, {name: "Spot"}]`
     - Objects with pet data: `{pet1: {name: "Fluffy"}, pet2: {name: "Spot"}}`
     - Comma-separated strings: `"Fluffy, Spot"`
     - Mixed formats (if applicable in your data)
   - Check booking table displays pet names correctly
   - Check booking detail drawer displays pet names correctly
   - Verify no regressions in pet name extraction
5. Run TypeScript check: `tsc --noEmit` (must pass)
6. Run build: `npm run build` (must succeed)
7. Commit: `refactor(bookings): remove inline utilities, use shared formatters`

**Success Criteria:**
- ✅ No inline utility functions in Bookings.tsx
- ✅ Imports work correctly
- ✅ Currency formatting displays correctly (all edge cases)
- ✅ Pet names extract correctly (all data formats: arrays, objects, strings)
- ✅ No regressions in pet name display (table, drawer, modals)
- ✅ Build succeeds
- ✅ No TypeScript errors

---

#### Step 0.2: Create useSitters Hook (30 min) ⭐ **DO SECOND**

**Why Second:** Simple hook extraction, no dependencies, reduces duplicate query logic.

**Tasks:**
1. Create `features/bookings/hooks/useSitters.ts`:
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { userService } from '@/services/user.service';
   import { useAuth } from '@/contexts/AuthContext';

   export const useSitters = () => {
     const { isAdmin, loading: authLoading } = useAuth();
     return useQuery({
       queryKey: ['sitters'],
       queryFn: () => userService.getUsersByRole('petSitter'),
       enabled: isAdmin && !authLoading,
     });
   };
   ```
2. Write tests for hook: `features/bookings/hooks/useSitters.test.ts`
3. Import and use in Bookings.tsx: `const { data: sitters = [] } = useSitters();`
4. Remove inline sitters query (lines 183-194)
5. Test: Verify sitters load correctly in assign modal
6. Run tests: `npm run test -- src/features/bookings/hooks/useSitters`
7. Commit: `refactor(bookings): extract useSitters hook`

**Success Criteria:**
- ✅ Hook created and tested
- ✅ Sitters load correctly
- ✅ No duplicate queries
- ✅ Tests pass

---

#### Step 0.3: Create Parallel Implementation Structure (20 min) ⭐ **DO THIRD**

**Why Third:** Establishes safety net before making changes. Allows instant rollback.

**Tasks:**
1. Verify feature flag exists: `useNewBookingStore` in `src/config/featureFlags.ts`
2. Test feature flag hook: `import { useFeatureFlag } from '@/hooks/useFeatureFlag'`
3. Create `BookingsPageLegacy.tsx`:
   - Copy entire current `Bookings.tsx` content
   - Rename component to `BookingsPageLegacy`
   - Export as default
4. Create `BookingsPageRefactored.tsx`:
   - Start with empty component (will be filled in next steps)
   - Import necessary dependencies
5. Update `Bookings.tsx` to switch between implementations:
   ```typescript
   import BookingsPageRefactored from './BookingsPageRefactored';
   import BookingsPageLegacy from './BookingsPageLegacy';
   import { useFeatureFlag } from '@/hooks/useFeatureFlag';

   const BookingsPage: React.FC = () => {
     const useNewVersion = useFeatureFlag('useNewBookingStore');
     return useNewVersion ? <BookingsPageRefactored /> : <BookingsPageLegacy />;
   };

   export default BookingsPage;
   ```
6. Test: Verify flag toggle works (default should use legacy)
7. Test: Set flag to `true` → should use refactored (empty, but no errors)
8. Test: Set flag to `false` → should use legacy (full functionality)
9. Commit: `refactor(bookings): create parallel implementation structure`

**Success Criteria:**
- ✅ Feature flag works correctly
- ✅ Parallel structure created
- ✅ Can switch between old/new via flag
- ✅ Legacy version works identically
- ✅ No build errors

---

#### Step 0.4: Replace useState with Zustand Store (60 min) ⚠️ **COMPLEX**

**Why Critical:** Consolidates 15+ useState hooks into single store for better performance.

**⚠️ IMPORTANT:** Form instances (`Form.useForm()`) stay in component, NOT in store!

**Tasks:**
1. In `BookingsPageRefactored.tsx`, import store:
   ```typescript
   import { useBookingStore } from '@/features/bookings/stores/useBookingStore';
   ```
2. Replace each useState one at a time (test after each):
   - `filters` → `const filters = useBookingStore(state => state.filters)`
   - `setFilters` → `const setFilters = useBookingStore(state => state.setFilters)`
   - `selectedBooking` → `const selectedBooking = useBookingStore(state => state.selectedBooking)`
   - `setSelectedBooking` → `const setSelectedBooking = useBookingStore(state => state.setSelectedBooking)`
   - `detailDrawerVisible` → `const detailDrawerVisible = useBookingStore(state => state.detailDrawerVisible)`
   - `setDetailDrawerVisible` → `const setDetailDrawerVisible = useBookingStore(state => state.setDetailDrawerVisible)`
   - `assignModalVisible` → `const assignModalVisible = useBookingStore(state => state.assignModalVisible)`
   - `setAssignModalVisible` → `const setAssignModalVisible = useBookingStore(state => state.setAssignModalVisible)`
   - `viewMode` → `const viewMode = useBookingStore(state => state.viewMode)`
   - `setViewMode` → `const setViewMode = useBookingStore(state => state.setViewMode)`
   - `selectedDate` → `const selectedDate = useBookingStore(state => state.selectedDate)`
   - `setSelectedDate` → `const setSelectedDate = useBookingStore(state => state.setSelectedDate)`
   - `createBookingModalVisible` → `const createBookingModalVisible = useBookingStore(state => state.createBookingModalVisible)`
   - `setCreateBookingModalVisible` → `const setCreateBookingModalVisible = useBookingStore(state => state.setCreateBookingModalVisible)`
   - `selectedPaymentMethod` → `const selectedPaymentMethod = useBookingStore(state => state.selectedPaymentMethod)`
   - `setSelectedPaymentMethod` → `const setSelectedPaymentMethod = useBookingStore(state => state.setSelectedPaymentMethod)`
   - `isRecurring` → `const isRecurring = useBookingStore(state => state.isRecurring)`
   - `setIsRecurring` → `const setIsRecurring = useBookingStore(state => state.setIsRecurring)`
   - `numberOfVisits` → `const numberOfVisits = useBookingStore(state => state.numberOfVisits)`
   - `setNumberOfVisits` → `const setNumberOfVisits = useBookingStore(state => state.setNumberOfVisits)`
   - `recurringFrequency` → `const recurringFrequency = useBookingStore(state => state.recurringFrequency)`
   - `setRecurringFrequency` → `const setRecurringFrequency = useBookingStore(state => state.setRecurringFrequency)`
   - `preferredDays` → `const preferredDays = useBookingStore(state => state.preferredDays)`
   - `setPreferredDays` → `const setPreferredDays = useBookingStore(state => state.setPreferredDays)`
   - `availablePets` → `const availablePets = useBookingStore(state => state.availablePets)`
   - `setAvailablePets` → `const setAvailablePets = useBookingStore(state => state.setAvailablePets)`
   - `petOptionsLoading` → `const petOptionsLoading = useBookingStore(state => state.petOptionsLoading)`
   - `setPetOptionsLoading` → `const setPetOptionsLoading = useBookingStore(state => state.setPetOptionsLoading)`
   - `loading` → `const loading = useBookingStore(state => state.loading)` (remove useState)
   - `setLoading` → `const setLoading = useBookingStore(state => state.setLoading)`

3. **Keep in component (DO NOT move to store):**
   - `const [form] = Form.useForm();` - Assign sitter form instance
   - `const [createBookingForm] = Form.useForm();` - Create booking form instance
   - `const selectedClientId = Form.useWatch('clientId', createBookingForm);` - Reactive form state
   - `const previousSelectedClientRef = useRef<string | null>(null);` - Ref for tracking changes

4. Test after each replacement: Verify state management works
5. Manual test: Change filters, open/close modals, switch views
6. Check browser console for errors/warnings
7. Run TypeScript check: `tsc --noEmit` (must pass)
8. Commit: `refactor(bookings): integrate Zustand store for state management`

**Success Criteria:**
- ✅ All useState replaced with store (except form instances)
- ✅ Form instances remain in component
- ✅ State management works correctly
- ✅ No console errors or warnings
- ✅ No TypeScript errors
- ✅ Manual testing passes

---

#### Step 0.5: Replace useQuery with useBookings Hook (30 min)

**Tasks:**
1. Import hook: `import { useBookings } from '@/features/bookings/hooks/useBookings';`
2. Replace inline bookings query (lines 142-163) with:
   ```typescript
   const { bookings, isLoading, error, refetch } = useBookings({ 
     filters: filters, // from store
     enabled: isAuthorized && !authLoading 
   });
   ```
3. Remove old `useQuery` code
4. Update all references to use `bookings` from hook
5. Test: Verify data fetching works, check loading states
6. Manual test: Apply filters, verify bookings update
7. Check console for errors
8. Commit: `refactor(bookings): integrate useBookings hook`

**Success Criteria:**
- ✅ Bookings query replaced with hook
- ✅ Data fetching works correctly
- ✅ Loading states work correctly
- ✅ Filters update bookings correctly

---

#### Step 0.6: Replace User Queries with useUserMap Hook (30 min)

**Tasks:**
1. Import hook: `import { useUserMap } from '@/shared/hooks/useUserMap';`
2. Remove inline `allUsers` query (lines 166-180)
3. Remove inline `userMap` creation (lines 197-204)
4. Remove inline `getUserName` function (lines 206-272)
5. Remove inline `getUserInitials` function (lines 274-281)
6. Use hook: `const { getUserName, getUserInitials, getUser, isLoadingUsers } = useUserMap();`
7. Replace all `getUserName()` calls to use hook version
8. Replace all `getUserInitials()` calls to use hook version
9. Test: Verify user names display correctly in table
10. Manual test: Check booking details show correct user names
11. Check console for errors
12. Commit: `refactor(bookings): integrate useUserMap hook`

**Success Criteria:**
- ✅ User queries replaced with hook
- ✅ User names display correctly
- ✅ No duplicate queries
- ✅ getUserName/getUserInitials work correctly

---

#### Step 0.7: Replace Mutations with useBookingActions Hook (60 min) ⚠️ **COMPLEX**

**Tasks:**
1. Import hook: `import { useBookingActions } from '@/features/bookings/hooks/useBookingActions';`
2. Use hook: `const { handleAssignSitter, handleApproveBooking, handleRejectBooking, handleCancelBooking, handleCreateBooking, handleCreateRecurringBooking, handleViewBooking, isAssigning, isApproving, isRejecting, isCancelling, isCreating } = useBookingActions();`
3. Replace each mutation handler:
   - Remove old `handleAssignSitter` function → use hook's `handleAssignSitter`
   - Remove old `handleApproveBooking` function → use hook's `handleApproveBooking`
   - Remove old `handleRejectBooking` function → use hook's `handleRejectBooking`
   - Remove old `handleCancelBooking` function → use hook's `handleCancelBooking`
   - Remove old `handleCreateBooking` function → use hook's `handleCreateBooking`
   - Remove old `handleCreateRecurringBooking` function → use hook's `handleCreateRecurringBooking`
   - Remove old `handleViewBooking` function → use hook's `handleViewBooking`
4. Update loading states to use hook's loading states (e.g., `isAssigning`, `isApproving`)
5. Test each action individually:
   - Test assign sitter
   - Test approve booking
   - Test reject booking
   - Test cancel booking
   - Test create booking
   - Test create recurring booking
   - Test view booking
6. Verify error handling works (test with network failures)
7. Check console for errors
8. Commit: `refactor(bookings): integrate useBookingActions hook`

**Success Criteria:**
- ✅ All mutations replaced with hook handlers
- ✅ All actions work correctly
- ✅ Loading states work correctly
- ✅ Error handling works correctly

---

#### Step 0.8: Handle Form Instances & useEffect Dependencies (45 min) ⚠️ **COMPLEX**

**Why Critical:** Forms and effects have complex dependencies that must work correctly.

**Tasks:**
1. Verify form instances work:
   - `form` (assign sitter) - opens/closes correctly
   - `createBookingForm` (create booking) - opens/closes correctly
   - `selectedClientId` (Form.useWatch) - updates reactively
2. Verify `useEffect` for loading pets (line 805) works:
   - Dependencies: `selectedClientId`, `clients`, `createBookingForm`, `isAuthorized`, `authLoading`
   - Verify pets load when client changes
   - Verify pets clear when client cleared
3. Verify `previousSelectedClientRef` works:
   - Tracks client changes correctly
   - Prevents unnecessary re-fetches
4. Test form submission flows:
   - Assign sitter form submission
   - Create booking form submission
   - Form validation
   - Error handling
5. Test form reset:
   - Form resets after successful submission
   - Form resets on cancel
6. Check console for errors
7. Commit: `refactor(bookings): verify form instances and effects work`

**Success Criteria:**
- ✅ Form instances work correctly
- ✅ Form.useWatch works correctly
- ✅ useEffect dependencies work correctly
- ✅ Form submissions work correctly
- ✅ Form validation works correctly

---

#### Step 0.9: Full Integration Test (60 min) ⚠️ **CRITICAL**

**Tasks:**
1. **TypeScript Check:**
   ```bash
   tsc --noEmit --strict
   ```
   Must pass with zero errors.

2. **Build Check:**
   ```bash
   npm run build
   ```
   Must succeed.

3. **Test Coverage:**
   ```bash
   npm run test:coverage -- src/features/bookings
   ```
   Verify >70% coverage.

4. **Smoke Tests:**
   ```bash
   npm run test:smoke
   ```
   Must pass.

5. **Manual Testing - Full User Flow:**
   - Create booking (one-time)
   - Create booking (recurring)
   - View booking details
   - Assign sitter
   - Approve booking
   - Reject booking
   - Cancel booking
   - Filter bookings
   - Switch views (table/calendar/list)
   - Export bookings

6. **Error Handling Tests:**
   - Network failure (disable network, test actions)
   - Validation errors (submit invalid forms)
   - Permission errors (if applicable)

7. **Console Check:**
   - No errors
   - No warnings (except expected ones)
   - Remove debug console.log statements

8. **Performance Check:**
   - Page loads in <3 seconds
   - No memory leaks
   - No excessive re-renders

9. **Feature Flag Test:**
   - Enable flag → new code works
   - Disable flag → legacy code works
   - Toggle works without errors

10. **Enable Feature Flag by Default:**
    - Set `default: true` in `featureFlags.ts` for `useNewBookingStore`
    - Or set via env var: `VITE_FEATURE_USE_NEW_BOOKING_STORE=true`

11. Commit: `test(bookings): verify hook integration complete`

**Success Criteria:**
- ✅ All tests pass (unit, integration, smoke)
- ✅ Test coverage >70%
- ✅ No TypeScript errors
- ✅ Build succeeds
- ✅ All functionality works identically to legacy
- ✅ No console errors or warnings
- ✅ Error handling works correctly
- ✅ Feature flag rollback works
- ✅ Performance maintained

---

**Phase 0 Success Criteria:**
- ✅ BookingsPageRefactored uses hooks/store (not old patterns)
- ✅ All functionality works identically to BookingsPageLegacy
- ✅ No console errors or warnings
- ✅ No TypeScript errors (`tsc --noEmit` passes)
- ✅ Smoke tests pass (`npm run test:smoke`)
- ✅ Build succeeds (`npm run build`)
- ✅ Test coverage >70%
- ✅ Error handling works (test network failures, validation errors)
- ✅ Feature flag rollback works (can disable flag and use legacy)
- ✅ Form instances work correctly
- ✅ useEffect dependencies work correctly

**Estimated Time:** ~6.5 hours (includes 20% buffer for debugging)

**Breakdown:**
- Step 0.1: Remove inline utilities - 15 min
- Step 0.2: Create useSitters hook - 30 min
- Step 0.3: Create parallel structure - 20 min
- Step 0.4: Replace useState with store - 60 min
- Step 0.5: Replace useQuery with hook - 30 min
- Step 0.6: Replace user queries - 30 min
- Step 0.7: Replace mutations - 60 min
- Step 0.8: Handle forms & effects - 45 min
- Step 0.9: Full integration test - 60 min
- **Buffer (20%):** ~70 min
- **Total:** ~6.5 hours

---

### Phase 1: Test Foundation (15 minutes) 🔴 **THEN DO THIS**

**Goal:** Verify hooks work correctly before building components on top

**Tasks:**
1. ✅ Run existing hook tests (tests already exist)
2. Verify hooks work with store
3. Test hooks in isolation
4. **Only proceed if all tests pass**

**Existing Test Files:**
- ✅ `src/features/bookings/hooks/useBookings.test.ts` (211 lines)
- ✅ `src/features/bookings/hooks/useBookingActions.test.ts` (214 lines)
- ✅ `src/features/bookings/stores/useBookingStore.test.ts` (246 lines)

**Test Commands:**
```bash
# Run all hook tests
npm run test -- src/features/bookings/hooks

# Run store tests
npm run test -- src/features/bookings/stores

# Run all booking-related tests
npm run test -- src/features/bookings
```

**Success Criteria:**
- ✅ All existing hook tests pass (18+ tests)
- ✅ All store tests pass (18 tests)
- ✅ Hooks integrate correctly with store
- ✅ No runtime errors
- ✅ No TypeScript errors

---

### Phase 2: Document Progress & Verify Safety (20 minutes) 📝 **THEN DO THIS**

**Goal:** Capture current state before component extraction and verify rollback works

**Tasks:**
1. Update `web-admin/REFACTORING_PROGRESS.md` with hook integration results
2. Document any issues found during Phase 0
3. Create component extraction checklist
4. **Test rollback procedure** (critical safety check)
   - Disable feature flag: Set `useNewBookingStore` to `false`
   - Verify old code still works
   - Re-enable feature flag
   - Verify new code works
   - Document rollback steps

**Why:** If something breaks later, you'll know exactly what was working before and how to rollback safely

---

### Phase 3: Extract ONE Component at a Time (Safe Incremental) ✅ **THEN DO THIS**

**Goal:** Extract components safely, one by one, with tests after each

**Strategy:** Extract smallest → largest (by complexity, not lines)

---

## 📋 Component Extraction Order (Safest First)

### Component 1: BookingViewSwitcher (~15 lines) ⭐ **START HERE**

**Why First:**
- ✅ Smallest and simplest (actual size: ~15 lines, not 250)
- ✅ Mostly UI, minimal logic
- ✅ No dependencies on other components
- ✅ Easy to test
- ✅ Low risk if broken

**Extraction Steps:**
1. Create `features/bookings/components/BookingViewSwitcher.tsx`
2. Copy code from Bookings.tsx
3. Update imports
4. Add props interface
5. Update Bookings.tsx to use component
6. **Test immediately** - verify page still works
7. Write component test
8. Commit: `feat: extract BookingViewSwitcher component`

**Test Checklist:**
- [ ] Component renders without errors
- [ ] View switching works (table/calendar/list)
- [ ] Active view indicator works
- [ ] Page still functions correctly

**Estimated Time:** 1-1.5 hours (includes 20% buffer)

---

### Component 2: AssignSitterModal (~150 lines) ⭐ **NEXT**

**Why Second:**
- ✅ Smallest modal
- ✅ Isolated functionality
- ✅ Easy to extract and test

**Extraction Steps:**
1. Create `features/bookings/components/AssignSitterModal.tsx`
2. Extract modal code
3. Extract form logic
4. Update Bookings.tsx
5. **Test immediately** - verify assignment works
6. Write component test
7. Commit: `feat: extract AssignSitterModal component`

**Test Checklist:**
- [ ] Modal opens/closes correctly
- [ ] Sitter selection works
- [ ] Form validation works
- [ ] Assignment mutation works
- [ ] Success/error messages display

**Estimated Time:** 1.5-2 hours (includes 20% buffer)

---

### Component 3: BookingFilters (~250 lines) ⭐ **THEN**

**Why Third:**
- ✅ Medium complexity
- ✅ Uses hooks we've tested
- ✅ Good test of hook integration
- ⚠️ **DEPENDS ON:** Store integration (filters state)

**Extraction Steps:**
1. Create `features/bookings/components/BookingFilters.tsx`
2. Extract filter UI
3. Extract filter logic (use store)
4. Update Bookings.tsx
5. **Test immediately** - verify filtering works
6. Write component test
7. Commit: `feat: extract BookingFilters component`

**Test Checklist:**
- [ ] Filters render correctly
- [ ] Filter changes update store
- [ ] Filter reset works
- [ ] Active filter count badge works
- [ ] Date range picker works

**Estimated Time:** 2.5-3.5 hours (includes 20% buffer)

---

### Component 4: BookingDetailDrawer (~300 lines) ⭐ **THEN**

**Why Fourth:**
- ✅ Medium complexity
- ✅ Uses hooks and store
- ✅ Good integration test
- ⚠️ **DEPENDS ON:** useBookingActions hook, useUserMap hook

**Extraction Steps:**
1. Create `features/bookings/components/BookingDetailDrawer.tsx`
2. Extract drawer code
3. Extract detail display logic
4. Update Bookings.tsx
5. **Test immediately** - verify drawer works
6. Write component test
7. Commit: `feat: extract BookingDetailDrawer component`

**Test Checklist:**
- [ ] Drawer opens/closes correctly
- [ ] Booking details display correctly
- [ ] Actions work (approve, reject, cancel)
- [ ] User names resolve correctly
- [ ] Pet names display correctly

**Estimated Time:** 2.5-3.5 hours (includes 20% buffer)

---

### Component 5: BookingTable (~400 lines) ⭐ **THEN**

**Why Fifth:**
- ⚠️ Larger component
- ⚠️ More complex logic
- ⚠️ Core functionality
- ⚠️ **DEPENDS ON:** BookingFilters (for filtered data), useUserMap hook

**Extraction Steps:**
1. Create `features/bookings/components/BookingTable.tsx`
2. Extract table code
3. Extract column definitions
4. Extract row actions
5. Update Bookings.tsx
6. **Test immediately** - verify table works
7. Write component test
8. Commit: `feat: extract BookingTable component`

**Test Checklist:**
- [ ] Table renders correctly
- [ ] Columns display correctly
- [ ] Sorting works
- [ ] Row actions work
- [ ] Empty state displays
- [ ] Loading state displays

**Estimated Time:** 3.5-5 hours (includes 20% buffer)

---

### Component 6: CreateBookingModal (~500 lines) ⭐ **LAST**

**Why Last:**
- ⚠️ Largest component
- ⚠️ Most complex logic
- ⚠️ Most critical functionality
- ⚠️ Highest risk
- ⚠️ **DEPENDS ON:** useBookingActions hook, store (form state), useUserMap hook

**Extraction Steps:**
1. Create `features/bookings/components/CreateBookingModal.tsx`
2. Extract modal code
3. Extract form logic (consider splitting into sub-components)
4. Extract validation logic
5. Update Bookings.tsx
6. **Test immediately** - verify creation works
7. Write comprehensive component test
8. Commit: `feat: extract CreateBookingModal component`

**Test Checklist:**
- [ ] Modal opens/closes correctly
- [ ] Form fields work
- [ ] Validation works
- [ ] Pet selection works
- [ ] Service type selection works
- [ ] Date/time selection works
- [ ] Recurring booking toggle works
- [ ] Form submission works
- [ ] Success/error handling works

**Estimated Time:** 5-6.5 hours (includes 20% buffer)

---

## 🛡️ Safety Checklist (Before Each Component)

Before extracting ANY component:

- [ ] **Backup:** Commit current state with descriptive message
- [ ] **Test:** Run existing tests (`npm run test:smoke`)
- [ ] **Build:** Verify build succeeds (`npm run build`)
- [ ] **TypeScript:** Verify no TypeScript errors (`tsc --noEmit`)
- [ ] **Manual Test:** Open page in browser, verify it works
- [ ] **Console Check:** Verify no console errors/warnings
- [ ] **Branch:** Ensure you're on feature branch (not main/master)
- [ ] **Rollback Ready:** Know which commit to revert to if needed

After extracting EACH component:

- [ ] **TypeScript:** `tsc --noEmit` - must succeed (no type errors)
- [ ] **Build:** `npm run build` - must succeed
- [ ] **Test:** `npm run test:smoke` - must pass
- [ ] **Component Test:** Write test for new component (aim for >70% coverage)
- [ ] **Manual Test:** Open page, test component functionality thoroughly
- [ ] **Console Check:** Verify no console errors/warnings
- [ ] **Error Handling:** Test error states (network errors, validation errors)
- [ ] **Integration Test:** Test component within Bookings page context
- [ ] **Commit:** Commit with descriptive message
- [ ] **Verify:** Page still works end-to-end (full user flow)

---

## 🧪 Testing Strategy

### After Each Component Extraction:

1. **Smoke Test** (30 seconds)
   ```bash
   npm run test:smoke
   ```

2. **Component Test** (5-10 minutes)
   - Create test file: `ComponentName.test.tsx`
   - Test rendering
   - Test user interactions
   - Test integration with hooks/store

3. **Manual Test** (2-3 minutes)
   - Open browser
   - Test component functionality
   - Verify no console errors

4. **Integration Test** (2-3 minutes)
   - Test component within Bookings page
   - Verify data flows correctly
   - Verify state updates correctly

---

## 📊 Progress Tracking

### Pre-Component Extraction Checklist

- [ ] **Phase 0:** Integrate hooks into Bookings.tsx (~6.5 hours) 🔴 **CRITICAL**
  - [ ] Step 0.1: Remove inline utilities (15 min) ⭐ **DO FIRST**
  - [ ] Step 0.2: Create useSitters hook (30 min) ⭐ **DO SECOND**
  - [ ] Step 0.3: Create parallel structure (20 min) ⭐ **DO THIRD**
  - [ ] Step 0.4: Replace useState with Zustand store (60 min) ⚠️ **COMPLEX**
  - [ ] Step 0.5: Replace useQuery with useBookings hook (30 min)
  - [ ] Step 0.6: Replace user queries with useUserMap hook (30 min)
  - [ ] Step 0.7: Replace mutations with useBookingActions hook (60 min) ⚠️ **COMPLEX**
  - [ ] Step 0.8: Handle form instances & useEffect dependencies (45 min) ⚠️ **COMPLEX**
  - [ ] Step 0.9: Full integration test (60 min) ⚠️ **CRITICAL**
- [ ] **Phase 1:** Test hooks (15 min)
- [ ] **Phase 2:** Document progress & verify safety (20 min)

### Component Extraction Checklist

- [ ] **Component 1:** BookingViewSwitcher (1-1.5 hours)
- [ ] **Component 2:** AssignSitterModal (1.5-2 hours)
- [ ] **Component 3:** BookingFilters (2.5-3.5 hours)
- [ ] **Component 4:** BookingDetailDrawer (2.5-3.5 hours)
- [ ] **Component 5:** BookingTable (3.5-5 hours)
- [ ] **Component 6:** CreateBookingModal (5-6.5 hours)

**Total Estimated Time:** 22.5-28.5 hours (includes 20% buffer, spread over 5-6 days)

**Breakdown:**
- Phase 0: Hook Integration - ~6.5 hours
- Phase 1: Test Foundation - 15 min
- Phase 2: Document & Safety - 20 min
- Component Extraction (6 components) - 16-22 hours
- **Total:** ~22.5-28.5 hours

---

## 🚨 Rollback Plan

### If Something Breaks During Phase 0 (Hook Integration):

1. **Immediate:** Disable feature flag
   - Set `useNewBookingStore` to `false` in `featureFlags.ts` or via env var
   - Old code will be used automatically
   - No code changes needed

2. **If feature flag doesn't work:** Revert last commit
   ```bash
   git revert HEAD
   ```

3. **If needed:** Reset to last known good state
   ```bash
   git reset --hard <last-good-commit>
   ```

### If Something Breaks During Component Extraction:

1. **Immediate:** Revert last commit
   ```bash
   git revert HEAD
   ```

2. **Verify:** Run tests and build to confirm rollback worked
   ```bash
   npm run test:smoke
   npm run build
   ```

3. **Document:** What broke and why (add to REFACTORING_PROGRESS.md)
4. **Fix:** Address issue before continuing
5. **Re-test:** Verify fix works before proceeding

### Before Starting: Test Rollback Procedure

**CRITICAL:** Test rollback before starting Phase 0:
1. Make a test commit
2. Try reverting it
3. Verify everything still works
4. Document the rollback steps that worked

---

## ✅ Success Criteria

**After ALL components extracted:**

- [ ] Bookings.tsx reduced to <300 lines
- [ ] All 6 components extracted and working
- [ ] All tests passing (>70% coverage)
- [ ] No console errors or warnings
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Page functionality unchanged (all features work identically)
- [ ] Build succeeds (`npm run build`)
- [ ] Error handling verified (network errors, validation errors)
- [ ] Performance maintained (no significant slowdown)
- [ ] All components have tests (>70% coverage each)

---

## 🎯 Recommended Next Steps

**Right Now:**
1. 🔴 **CRITICAL:** Test rollback procedure (15 min) - Verify you can undo changes
2. 🔴 **CRITICAL:** Step 0.1 - Remove inline utilities (15 min) - Simplest, no dependencies
3. 🔴 **CRITICAL:** Step 0.2 - Create useSitters hook (30 min) - Extract duplicate query
4. 🔴 **CRITICAL:** Step 0.3 - Create parallel structure (20 min) - Safety net before changes
5. 🔴 **CRITICAL:** Step 0.4-0.9 - Integrate hooks into Bookings.tsx (~5 hours) - Replace old patterns
6. ✅ **Test hooks** (15 min) - Run existing tests, verify foundation works
7. ✅ **Document progress & test rollback** (20 min) - Capture state, verify safety
8. ✅ **Extract Component 1** (BookingViewSwitcher) - Smallest, safest start

**⚠️ DO NOT skip Phase 0 - Components depend on hooks being integrated!**
**⚠️ DO NOT skip rollback testing - You need to know how to undo if something breaks!**
**⚠️ DO Steps 0.1-0.3 FIRST - They establish safety and reduce code before complex changes!**

**Today:**
- Complete Phase 1 & 2
- Extract Component 1
- Test thoroughly
- Commit

**Tomorrow:**
- Extract Component 2 (AssignSitterModal)
- Extract Component 3 (BookingFilters)
- Test after each

**This Week:**
- Complete all 6 components
- Full integration testing
- Update documentation

---

## 💡 Key Principles

1. **One Component at a Time** - Never extract multiple components simultaneously
2. **Test After Each** - Verify before moving to next (tests, build, manual test)
3. **Commit Frequently** - Small, atomic commits with descriptive messages
4. **Manual Test Always** - Don't rely only on automated tests
5. **Rollback Ready** - Know how to undo if needed (test rollback before starting)
6. **Verify Dependencies** - Check what each step depends on before starting
7. **Error Handling** - Always test error states, not just happy paths
8. **TypeScript First** - Fix type errors before running tests
9. **Console Clean** - No errors or warnings in browser console
10. **Feature Flag Safety** - Use feature flags for instant rollback capability

---

**This plan ensures maximum safety while following the refactoring plan. Each step is small, testable, and reversible.**

---

## 📋 Quick Reference: Critical Corrections Made

### ✅ Fixed Issues (v2.0):
1. ✅ Added Step 0.1: Remove inline utilities (was missing, utilities still inline)
2. ✅ Added Step 0.2: Create useSitters hook (sitters query was not addressed)
3. ✅ Added Step 0.3: Create parallel structure (matches WEB_ADMIN_REFACTORING_PLAN.md pattern)
4. ✅ Updated Step 0.4: Document form instances stay in component (critical fix)
5. ✅ Added Step 0.8: Handle form instances & useEffect dependencies (was missing)
6. ✅ Updated Step 0.9: Comprehensive integration test with all checks
7. ✅ Feature flag pattern corrected (parallel implementations, not wrapping)
8. ✅ Added `useUserMap` integration step (was missing)
9. ✅ Updated Phase 1 to run existing tests (not write new ones)
10. ✅ Fixed test command format
11. ✅ Corrected component size estimates (BookingViewSwitcher is ~15 lines, not 250)
12. ✅ Added dependency notes to steps
13. ✅ Added error handling verification
14. ✅ Added rollback testing step
15. ✅ Updated time estimates (more realistic: ~6.5 hours for Phase 0)
16. ✅ Added TypeScript strictness checks
17. ✅ Added console error checking
18. ✅ Added dependency tracking between steps
19. ✅ Added form instance handling (Form.useForm stays in component)
20. ✅ Added useEffect dependency verification
21. ✅ Added test coverage verification (>70% target)
22. ✅ Added performance monitoring steps

### 🎯 Key Safety Improvements:
- Feature flag allows instant rollback without code changes
- Each step has clear dependencies
- Rollback procedure tested before starting
- Error handling verified at each stage
- TypeScript errors caught early
- Console errors checked manually
- Time buffers account for debugging

---

**Last Updated:** v2.0 - Comprehensive corrections based on codebase analysis  
**Status:** Ready for execution - All critical issues addressed  
**Key Changes:** Added 3 new steps (0.1, 0.2, 0.3), fixed form handling, parallel implementation pattern, updated time estimates

---

## 📋 Critical Corrections Summary

### New Steps Added:
- **Step 0.1:** Remove inline utilities (15 min) - Simplest, do first
- **Step 0.2:** Create useSitters hook (30 min) - Extract duplicate query
- **Step 0.3:** Create parallel structure (20 min) - Safety net

### Critical Fixes:
- **Form Instances:** Documented that `Form.useForm()` stays in component, NOT in store
- **Parallel Pattern:** Changed from wrapping code to parallel implementations (BookingsPageLegacy + BookingsPageRefactored)
- **useEffect:** Added step to verify complex useEffect dependencies work correctly
- **Time Estimates:** Updated from 3.5 hours to 6.5 hours (more realistic)

### Improvements:
- Comprehensive integration test (Step 0.9) with all validation checks
- Test coverage verification (>70% target)
- Performance monitoring
- TypeScript strictness checks
- Console error monitoring

**All corrections verified against actual codebase and WEB_ADMIN_REFACTORING_PLAN.md**

