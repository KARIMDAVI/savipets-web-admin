/**
 * Lazy Component Loaders
 * 
 * Lazy-loaded components for code splitting and bundle size optimization.
 */

import React, { Suspense } from 'react';
import { Spin } from 'antd';

/**
 * Loading fallback component
 */
const ComponentLoading: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 200,
    padding: '20px' 
  }}>
    <Spin size="large" />
  </div>
);

/**
 * Higher-order component for lazy loading with Suspense
 */
export function withLazyLoading<T extends React.ComponentType<any>>(
  lazyComponent: React.LazyExoticComponent<T>
): React.FC<React.ComponentProps<T>> {
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<ComponentLoading />}>
      {React.createElement(lazyComponent, props)}
    </Suspense>
  );
}

/**
 * Lazy-loaded CRM components
 * These are heavy components that are only loaded when needed
 */

// Analytics components (heavy - includes charts)
export const AnalyticsDashboardLazy = React.lazy(
  () => import('../components/AnalyticsDashboard').then(module => ({
    default: module.AnalyticsDashboard,
  }))
);

export const RevenueAnalyticsLazy = React.lazy(
  () => import('../components/RevenueAnalytics').then(module => ({
    default: module.RevenueAnalytics,
  }))
);

// Task and Workflow managers (heavy - complex state management)
export const TaskManagerLazy = React.lazy(
  () => import('../components/TaskManager').then(module => ({
    default: module.TaskManager,
  }))
);

export const WorkflowManagerLazy = React.lazy(
  () => import('../components/WorkflowManager').then(module => ({
    default: module.WorkflowManager,
  }))
);

// Import/Export components (heavy - includes file processing libraries)
export const ImportModalLazy = React.lazy(
  () => import('../components/ImportModal').then(module => ({
    default: module.ImportModal,
  }))
);

// Tag Management (moderate - includes color picker)
export const TagManagementLazy = React.lazy(
  () => import('../components/TagManagement').then(module => ({
    default: module.TagManagement,
  }))
);

// Advanced Filters (moderate - complex filter logic)
export const AdvancedFiltersLazy = React.lazy(
  () => import('../components/AdvancedFilters').then(module => ({
    default: module.AdvancedFilters,
  }))
);

// Bulk Actions Toolbar (moderate - includes bulk operations)
export const BulkActionsToolbarLazy = React.lazy(
  () => import('../components/BulkActionsToolbar').then(module => ({
    default: module.BulkActionsToolbar,
  }))
);











