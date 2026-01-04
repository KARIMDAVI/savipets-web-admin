# Design System Documentation
## SaviPets Web Admin

**Version:** 1.0  
**Last Updated:** $(date)

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Theme System](#theme-system)
3. [Components](#components)
4. [Utilities](#utilities)
5. [Usage Examples](#usage-examples)

---

## Design Tokens

### Colors

```typescript
import { colors } from '@/design/tokens';

// Primary brand colors
colors.primary[500] // Main brand color: #f0932b

// Semantic colors
colors.success[500] // Success: #52c41a
colors.warning[500] // Warning: #faad14
colors.error[500]   // Error: #f5222d
colors.info[500]    // Info: #1890ff

// Neutral colors
colors.neutral[0]   // White
colors.neutral[900] // Dark gray

// Background colors
colors.background.default    // #f0f2f5
colors.background.secondary  // #fafafa
colors.background.tertiary   // #ffffff

// Text colors
colors.text.primary    // #262626
colors.text.secondary   // #595959
colors.text.tertiary    // #8c8c8c
colors.text.disabled    // #bfbfbf
colors.text.inverse     // #ffffff
```

### Spacing

```typescript
import { spacing, spacingScale } from '@/design/tokens';

// Named spacing
spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 16px
spacing.lg   // 24px
spacing.xl   // 32px
spacing.xxl  // 48px

// Scale (0-16)
spacingScale[4]  // 16px
spacingScale[8]  // 32px
```

### Typography

```typescript
import { typography } from '@/design/tokens';

// Font families
typography.fontFamily.sans // System font stack
typography.fontFamily.mono // Monospace font stack

// Font sizes
typography.fontSize.xs    // 12px
typography.fontSize.sm    // 14px
typography.fontSize.base  // 16px
typography.fontSize.lg   // 18px
typography.fontSize.xl   // 20px
typography.fontSize['2xl'] // 24px

// Font weights
typography.fontWeight.light    // 300
typography.fontWeight.normal   // 400
typography.fontWeight.medium   // 500
typography.fontWeight.semibold // 600
typography.fontWeight.bold     // 700

// Line heights
typography.lineHeight.tight   // 1.25
typography.lineHeight.normal  // 1.5
typography.lineHeight.relaxed // 1.75
typography.lineHeight.loose   // 2
```

### Shadows

```typescript
import { shadows } from '@/design/tokens';

shadows.sm        // Small shadow
shadows.md        // Medium shadow
shadows.lg        // Large shadow
shadows.card      // Card shadow
shadows.cardHover // Card hover shadow
shadows.sidebar   // Sidebar shadow
shadows.header    // Header shadow
shadows.modal     // Modal shadow
```

### Borders

```typescript
import { borders } from '@/design/tokens';

// Border radius
borders.radius.sm   // 4px
borders.radius.md   // 8px
borders.radius.lg   // 12px
borders.radius.xl   // 16px
borders.radius.full // 9999px

// Border width
borders.width.thin   // 1px
borders.width.medium // 2px
borders.width.thick  // 4px

// Border colors
borders.color.default // #f0f0f0
borders.color.light   // #fafafa
borders.color.dark    // #d9d9d9
```

### Breakpoints

```typescript
import { breakpoints } from '@/design/tokens';

breakpoints.xs  // 0px
breakpoints.sm  // 576px
breakpoints.md  // 768px
breakpoints.lg  // 992px
breakpoints.xl  // 1200px
breakpoints.xxl // 1600px
```

---

## Theme System

### Using Theme

```typescript
import { useTheme } from '@/design/utils/useTheme';

const MyComponent = () => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  return (
    <div style={{ background: theme.colors.background }}>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
};
```

### Theme Structure

```typescript
theme.colors.primary              // Primary color
theme.colors.success              // Success color
theme.colors.warning              // Warning color
theme.colors.error                // Error color
theme.colors.info                 // Info color
theme.colors.background           // Background color
theme.colors.backgroundSecondary  // Secondary background
theme.colors.backgroundTertiary   // Tertiary background
theme.colors.text                 // Primary text color
theme.colors.textSecondary        // Secondary text color
theme.colors.border               // Border color
theme.spacing                     // Spacing tokens
theme.typography                  // Typography tokens
theme.shadows                     // Shadow tokens
theme.borders                     // Border tokens
theme.mode                        // 'light' | 'dark'
```

---

## Components

### EmptyState

```typescript
import { EmptyState } from '@/components/common';

<EmptyState
  title="No items"
  description="Get started by creating your first item"
  action={{
    label: 'Create Item',
    onClick: handleCreate
  }}
  secondaryAction={{
    label: 'Learn More',
    onClick: handleLearnMore
  }}
  size="default" // 'small' | 'default' | 'large'
/>
```

### SkeletonLoader

```typescript
import { SkeletonLoader } from '@/components/common';

// Card skeleton
<SkeletonLoader type="card" count={4} />

// Table skeleton
<SkeletonLoader type="table" rows={8} />

// List skeleton
<SkeletonLoader type="list" count={5} />

// Form skeleton
<SkeletonLoader type="form" rows={4} />
```

### ErrorState

```typescript
import { ErrorState } from '@/components/common';

<ErrorState
  title="Something went wrong"
  message="An error occurred. Please try again."
  onRetry={handleRetry}
  retryLabel="Try Again"
/>
```

### ThemeToggle

```typescript
import { ThemeToggle } from '@/components/common';

<ThemeToggle />
```

### FileUploadField

```typescript
import { FileUploadField } from '@/components/forms';

<FileUploadField
  name="file"
  label="Upload File"
  maxSize={5} // MB
  allowedMimeTypes={['image/jpeg', 'image/png']}
  onFileValidate={async (file) => {
    // Server-side validation
    return true;
  }}
/>
```

### PasswordStrength

```typescript
import { PasswordStrength } from '@/components/forms';

<PasswordStrength
  password={password}
  checkBreaches={true}
/>
```

---

## Utilities

### Responsive Hook

```typescript
import { useResponsive } from '@/design/utils/useResponsive';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, width } = useResponsive();

  if (isMobile) {
    return <MobileView />;
  }

  return <DesktopView />;
};
```

### Color Contrast

```typescript
import { 
  getContrastRatio, 
  getAccessibleTextColor,
  meetsWCAGContrast 
} from '@/design/utils/colorContrast';

// Get contrast ratio
const ratio = getContrastRatio('#ffffff', '#000000');

// Get accessible text color
const textColor = getAccessibleTextColor('#ffffff', 4.5);

// Check WCAG compliance
const meetsAA = meetsWCAGContrast('#ffffff', '#000000', 'AA', 'normal');
```

### Style Utilities

```typescript
import { useStyles, staticStyles } from '@/design/utils/styles';

const MyComponent = () => {
  const styles = useStyles();

  return (
    <div style={styles.card}>
      Content
    </div>
  );
};
```

### Animations

```typescript
import { animations } from '@/design/utils/animations';

<div style={animations.fadeIn}>
  Content
</div>
```

---

## Usage Examples

### Creating a Themed Card

```typescript
import { useTheme } from '@/design/utils/useTheme';
import { spacing, shadows, borders } from '@/design/tokens';

const ThemedCard = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div style={{
      padding: spacing.lg,
      background: theme.colors.backgroundTertiary,
      borderRadius: borders.radius.md,
      boxShadow: shadows.card,
      color: theme.colors.text,
    }}>
      {children}
    </div>
  );
};
```

### Responsive Component

```typescript
import { useResponsive } from '@/design/utils/useResponsive';
import { spacing } from '@/design/tokens';

const ResponsiveComponent = () => {
  const { isMobile, isDesktop } = useResponsive();

  return (
    <div style={{
      padding: isMobile ? spacing.sm : spacing.lg,
    }}>
      Content
    </div>
  );
};
```

---

## Best Practices

1. **Always use design tokens** - Never hardcode colors, spacing, or other values
2. **Use theme for dynamic colors** - Access theme colors through `useTheme()` hook
3. **Follow spacing scale** - Use the 4px-based spacing scale consistently
4. **Check contrast** - Use color contrast utilities for accessibility
5. **Test responsive** - Use `useResponsive()` hook for breakpoint logic
6. **Use components** - Prefer reusable components over custom implementations

---

## Accessibility

All components follow WCAG 2.1 AA standards:
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader support

---

**For questions or contributions, please refer to the main project documentation.**

