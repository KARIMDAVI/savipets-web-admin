# Live Tracking Page Refactoring Plan
## Ultimate Enhanced Plan - Safe, Incremental, Verified

**Current State:** `web-admin/src/pages/LiveTracking.tsx` = 586 lines (exceeds 400-line limit)  
**Target State:** All files < 300 lines, zero functionality loss, build-verified

---

## 🎯 Refactoring Goals

1. **Split 586-line page into maintainable modules** (< 300 lines each)
2. **Preserve all existing functionality** (map, markers, routes, subscriptions)
3. **Zero breaking changes** (same public API, same behavior)
4. **Type-safe refactor** (strict TypeScript checks pass)
5. **Build-verified** (no compilation errors)

---

## 📋 Pre-Flight Checklist

### Step 0: Safety Setup

```bash
# Create feature branch
git checkout -b refactor/live-tracking-split

# Commit current state as checkpoint
git add web-admin/src/pages/LiveTracking.tsx
git commit -m "checkpoint: LiveTracking.tsx before refactor (586 lines)"

# Verify current build works
cd web-admin
npm run build
# ✅ Must pass before proceeding
```

**Verification:** Build succeeds, no errors

---

## 🏗️ Refactoring Steps (Incremental Order)

### Step 1: Create Types Foundation
**File:** `web-admin/src/features/live-tracking/types/liveTrackingPage.types.ts`  
**Lines:** ~50 lines  
**Risk:** Zero (new file, no dependencies)

**Purpose:** Centralize all types used by hooks to prevent circular dependencies

**Content:**
```typescript
import type { MapStatus } from '../components/MapContainer';
import type { EnhancedSitterLocation } from './live-tracking.types';
import type { VisitTrackingData } from '@/services/tracking.service';

/**
 * Map tracking hook return type
 */
export interface UseMapboxTrackingReturn {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  mapStatus: MapStatus;
  setMapStyle: (style: string) => void;
  handleRetryMap: () => void;
  handleCaptureScreenshot: () => void;
}

/**
 * Map tracking hook dependencies
 */
export interface UseMapboxTrackingDeps {
  mapStyle: string;
  activeBookings: Array<{ id: string; sitterId: string }>;
  sitters: Array<{ id: string; firstName: string; lastName: string; email: string }>;
  sitterLocations: Map<string, EnhancedSitterLocation>;
  visitTrackings: Map<string, VisitTrackingData>;
  setSitterLocations: React.Dispatch<React.SetStateAction<Map<string, EnhancedSitterLocation>>>;
  setVisitTrackings: React.Dispatch<React.SetStateAction<Map<string, VisitTrackingData>>>;
  onMarkerClick: (location: EnhancedSitterLocation) => void;
}

/**
 * Page hook return type
 */
export interface UseLiveTrackingPageReturn {
  // State
  selectedSitter: EnhancedSitterLocation | null;
  detailModalVisible: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  mapStyle: string;
  stats: {
    activeVisits: number;
    activeSitters: number;
    totalRevenue: number;
    avgDuration: number;
  };
  
  // Map tracking hook
  mapTracking: UseMapboxTrackingReturn;
  
  // Handlers
  setSelectedSitter: (sitter: EnhancedSitterLocation | null) => void;
  setDetailModalVisible: (visible: boolean) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  handleRefresh: () => void;
  handleMapStyleChange: (style: string) => void;
  handleGenerateReport: () => void;
  handleExportRoute: (visitId: string) => void;
  selectedVisitTracking?: VisitTrackingData;
}
```

**Verification:**
```bash
# TypeScript should compile
npx tsc --noEmit --strict
# ✅ No errors
```

---

### Step 2: Extract TrackingLegend Component
**File:** `web-admin/src/features/live-tracking/components/TrackingLegend.tsx`  
**Lines:** ~40 lines  
**Risk:** Low (isolated visual component)

**Purpose:** Extract legend Card into reusable component

**Content:**
```typescript
import React from 'react';
import { Card, Space, Typography } from 'antd';
import { mapTokens } from '@/design/mapTokens';

const { Title, Text } = Typography;

export const TrackingLegend: React.FC = () => {
  return (
    <Card style={{ marginTop: '16px' }}>
      <Title level={5}>Legend</Title>
      <Space wrap>
        <Space>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: mapTokens.colors.secondary,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          <Text>Active Sitter</Text>
        </Space>
        <Space>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: mapTokens.colors.warning,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          <Text>Idle Sitter</Text>
        </Space>
        <Space>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: mapTokens.colors.danger,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          <Text>Offline Sitter</Text>
        </Space>
      </Space>
    </Card>
  );
};
```

**Update:** `web-admin/src/features/live-tracking/components/index.ts`
```typescript
export { TrackingLegend } from './TrackingLegend';
```

**Update:** `web-admin/src/pages/LiveTracking.tsx` (replace lines 546-562)
```typescript
import { TrackingLegend } from '@/features/live-tracking/components';

// In JSX:
<TrackingLegend />
```

**Verification:**
```bash
# Build should still work
npm run build
# ✅ No errors, legend still renders
```

**Commit:**
```bash
git add web-admin/src/features/live-tracking/components/TrackingLegend.tsx
git add web-admin/src/features/live-tracking/components/index.ts
git add web-admin/src/pages/LiveTracking.tsx
git commit -m "refactor: extract TrackingLegend component"
```

---

### Step 3: Extract useMapboxTracking Hook
**File:** `web-admin/src/features/live-tracking/hooks/useMapboxTracking.ts`  
**Lines:** ~280 lines  
**Risk:** Medium (complex map logic, subscriptions, cleanup)

**Purpose:** Extract all Mapbox-specific logic (map init, markers, routes, subscriptions)

**Key Requirements:**
- ✅ Explicit dependencies via params (no implicit imports)
- ✅ All cleanup logic preserved (subscriptions, timers, map destruction)
- ✅ Ref timing handled correctly (mapContainerRef returned, not created internally)
- ✅ Pending updates queue maintained
- ✅ Marker/route removal timeouts preserved

**Content Structure:**
```typescript
import { useRef, useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Unsubscribe } from 'firebase/firestore';
import { message } from 'antd';
import { trackingService, type VisitTrackingData } from '@/services/tracking.service';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { MapStatus } from '../components/MapContainer';
import type { UseMapboxTrackingDeps, UseMapboxTrackingReturn } from '../types/liveTrackingPage.types';
import { mapTokens } from '@/design/mapTokens';
import { captureMapScreenshot as captureScreenshotHelper } from '../utils/trackingHelpers';
import dayjs from 'dayjs';

export const useMapboxTracking = (
  deps: UseMapboxTrackingDeps
): UseMapboxTrackingReturn => {
  // All refs, state, callbacks from original lines 28-240
  // Map initialization from lines 291-383
  // Subscriptions from lines 132-147, 243-288, 394-414
  // Return: mapContainerRef, mapStatus, setMapStyle, handleRetryMap, handleCaptureScreenshot
};
```

**Critical Cleanup Checklist:**
- [ ] Subscription teardowns (lines 144-146, 284-287)
- [ ] Timer clears (styleLoadTimeoutId, markerRemovalTimeouts, routeRemovalTimeouts)
- [ ] Map instance destruction (lines 372-375)
- [ ] Marker/route cleanup (lines 376-381)

**Verification:**
```bash
# Build check
npm run build
# ✅ No errors

# TypeScript strict check
npx tsc --noEmit --strict
# ✅ No type errors

# Visual check: Map renders on page load
# ✅ Map appears, markers show, routes draw
```

**Commit:**
```bash
git add web-admin/src/features/live-tracking/hooks/useMapboxTracking.ts
git add web-admin/src/features/live-tracking/hooks/index.ts
git commit -m "refactor: extract useMapboxTracking hook with full map logic"
```

---

### Step 4: Extract useLiveTrackingPage Hook
**File:** `web-admin/src/features/live-tracking/hooks/useLiveTrackingPage.ts`  
**Lines:** ~150 lines  
**Risk:** Low (orchestration layer, depends on Step 3)

**Purpose:** Orchestrate page-level state and handlers, coordinate with map hook

**Content Structure:**
```typescript
import { useState, useMemo, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useLiveTracking } from './useLiveTracking';
import { useMapboxTracking } from './useMapboxTracking';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { UseLiveTrackingPageReturn } from '../types/liveTrackingPage.types';
import { calculateTrackingStats, generateTrackingReport as generateReportHelper, exportJSONFile } from '../utils/trackingHelpers';

export const useLiveTrackingPage = (): UseLiveTrackingPageReturn => {
  // State: selectedSitter, detailModalVisible, autoRefresh, refreshInterval, mapStyle
  // Data: useLiveTracking hook
  // Map: useMapboxTracking hook with dependencies
  // Stats: useMemo with calculateTrackingStats
  // Handlers: refresh, map style change, generate report, export route
  // Return: all state + handlers + map tracking hook
};
```

**Verification:**
```bash
npm run build
# ✅ No errors

npx tsc --noEmit --strict
# ✅ No type errors
```

**Commit:**
```bash
git add web-admin/src/features/live-tracking/hooks/useLiveTrackingPage.ts
git add web-admin/src/features/live-tracking/hooks/index.ts
git commit -m "refactor: extract useLiveTrackingPage orchestration hook"
```

---

### Step 5: Refactor Page Component
**File:** `web-admin/src/pages/LiveTracking.tsx`  
**Target:** ~150 lines (down from 586)  
**Risk:** Low (now just JSX + hook calls)

**Purpose:** Thin view layer that uses hooks and renders components

**Content Structure:**
```typescript
import React from 'react';
import { Typography, Alert } from 'antd';
import { useLiveTrackingPage } from '@/features/live-tracking/hooks';
import {
  TrackingStatsCards,
  TrackingControls,
  TrackingActions,
  MapContainer,
  SitterDetailModal,
  TrackingLegend,
} from '@/features/live-tracking/components';

const { Title, Text } = Typography;

const LiveTrackingPage: React.FC = () => {
  const {
    selectedSitter,
    detailModalVisible,
    autoRefresh,
    refreshInterval,
    mapStyle,
    stats,
    mapTracking,
    setSelectedSitter,
    setDetailModalVisible,
    setAutoRefresh,
    setRefreshInterval,
    handleRefresh,
    handleMapStyleChange,
    handleGenerateReport,
    handleExportRoute,
    selectedVisitTracking,
  } = useLiveTrackingPage();

  return (
    <div>
      {/* Header */}
      {/* Stats Cards */}
      {/* Alerts */}
      {/* Controls */}
      {/* Actions */}
      {/* Map */}
      {/* Legend */}
      {/* Modal */}
      {/* Token Warning */}
    </div>
  );
};

export default LiveTrackingPage;
```

**Verification:**
```bash
npm run build
# ✅ No errors

npx tsc --noEmit --strict
# ✅ No type errors

# File size check
wc -l web-admin/src/pages/LiveTracking.tsx
# ✅ Should be ~150 lines (down from 586)
```

**Commit:**
```bash
git add web-admin/src/pages/LiveTracking.tsx
git commit -m "refactor: simplify LiveTracking page to view layer"
```

---

## ✅ Final Verification

### Step 6: Comprehensive Checks

**1. File Size Verification**
```bash
cd web-admin
find src/features/live-tracking -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -n
```

**Expected Output:**
```
   ~40  src/features/live-tracking/components/TrackingLegend.tsx
   ~50  src/features/live-tracking/types/liveTrackingPage.types.ts
  ~150  src/features/live-tracking/hooks/useLiveTrackingPage.ts
  ~150  src/pages/LiveTracking.tsx
  ~280  src/features/live-tracking/hooks/useMapboxTracking.ts
```

**✅ All files < 300 lines**

**2. Build Verification**
```bash
npm run build
```
**✅ Build succeeds, no errors**

**3. TypeScript Strict Check**
```bash
npx tsc --noEmit --strict
```
**✅ No type errors**

**4. Circular Dependency Check**
```bash
# Check for circular imports
npx madge --circular src/features/live-tracking
```
**✅ No circular dependencies**

**5. Smoke Test Checklist**
- [ ] Page loads without errors
- [ ] Map renders on first load
- [ ] Markers appear when sitters are active
- [ ] Routes draw when visit tracking data exists
- [ ] Clicking marker opens detail modal
- [ ] Map style change works
- [ ] Refresh button works
- [ ] Generate report works
- [ ] Export route works
- [ ] Screenshot capture works
- [ ] Auto-refresh toggles correctly
- [ ] Legend displays correctly
- [ ] Alerts show when no data

**6. Cleanup Verification**
```bash
# Grep for cleanup patterns
grep -r "return () =>" src/features/live-tracking/hooks/useMapboxTracking.ts
```
**✅ All cleanup functions preserved**

---

## 🚨 Red Flags to Watch For

### During Refactoring

1. **File Exceeds 350 Lines**
   - **Action:** Split further before committing
   - **Example:** If `useMapboxTracking.ts` > 350 lines, extract `useMarkerManager` and `useRouteManager`

2. **Build Time Increases >20%**
   - **Action:** Check for circular imports
   - **Fix:** Ensure all types come from shared types file

3. **Map Doesn't Render on First Load**
   - **Action:** Check `mapContainerRef` wiring
   - **Fix:** Ensure ref is passed from hook → page → MapContainer

4. **Markers Disappear After Selecting Sitter**
   - **Action:** Check state dependency arrays in `useMapboxTracking`
   - **Fix:** Ensure `sitterLocations` is in dependency array

5. **TypeScript Errors After Split**
   - **Action:** Check import paths, ensure types are exported
   - **Fix:** Update barrel exports in `index.ts` files

### Post-Refactoring

1. **Runtime Errors in Console**
   - **Action:** Check subscription cleanup, timer cleanup
   - **Fix:** Ensure all `useEffect` cleanup functions are preserved

2. **Memory Leaks (Markers/Routes Not Removing)**
   - **Action:** Check timeout cleanup logic
   - **Fix:** Ensure `markerRemovalTimeouts` and `routeRemovalTimeouts` are cleared

---

## 📊 Success Metrics

- ✅ **All files < 300 lines** (target: < 400, buffer: < 300)
- ✅ **Zero build errors**
- ✅ **Zero TypeScript errors**
- ✅ **Zero circular dependencies**
- ✅ **All functionality preserved** (smoke test passes)
- ✅ **All cleanup logic preserved** (no memory leaks)

---

## 🔄 Rollback Plan

If anything breaks:

```bash
# Revert to checkpoint
git reset --hard HEAD~5  # Adjust based on number of commits
# Or revert specific commit
git revert <commit-hash>
```

---

## 📝 Final Commit Message

```bash
git commit -m "refactor: split LiveTracking page into maintainable modules

- Extract TrackingLegend component (40 lines)
- Extract useMapboxTracking hook (280 lines) with full map logic
- Extract useLiveTrackingPage orchestration hook (150 lines)
- Simplify LiveTracking page to view layer (150 lines)
- Add shared types to prevent circular dependencies

All files now < 300 lines, zero functionality loss, build-verified."
```

---

## 🎯 Post-Refactor Maintenance

**File Size Monitoring:**
- Add pre-commit hook to check file sizes
- Warn if any file approaches 350 lines

**Documentation:**
- Update `ARCHITECTURE.md` with new structure
- Add comments explaining hook dependencies

**Testing:**
- Add unit tests for `useMapboxTracking` hook
- Add unit tests for `useLiveTrackingPage` hook
- Add integration test for full page flow

---

**Plan Status:** ✅ Ready for Execution  
**Estimated Time:** 2-3 hours  
**Risk Level:** Low (incremental, verified steps)



