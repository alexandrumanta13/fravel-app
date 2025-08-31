# Layout System Architecture

## Overview

Modern, scalable layout system built with Angular 17+ standalone components and advanced i18n support.

## 🏗️ Architecture

### Core Components
- **LayoutComponent**: Main layout orchestrator with dynamic component loading
- **ResponsiveLayoutComponent**: Handles mobile/tablet/desktop layouts
- **AdminLayoutComponent**: Specialized admin interface layout
- **BaseLayoutComponent**: Abstract base class for all layouts

### Services
- **LayoutStrategyService**: Strategy pattern for dynamic layout selection
- **LocaleLayoutService**: RTL/LTR support, locale-aware formatting
- **LayoutLoggerService**: Environment-aware logging system
- **LayoutResolver**: Performance-optimized route data resolution

## 🌍 Internationalization Features

### RTL/LTR Support
```typescript
// Automatic direction detection
<div [class.rtl]="isRTL" [attr.dir]="localeInfo?.direction">
```

### Locale-aware Formatting
```html
<!-- Currency formatting -->
{{ flightPrice | localeCurrency:'EUR' }}

<!-- Date formatting -->
{{ departureDate | localeDate }}

<!-- Number formatting -->
{{ passengerCount | localeNumber }}
```

### Language-specific Styling
```scss
.locale-ro {
  font-family: 'SFProDisplay-Regular', sans-serif;
}

.locale-ar {
  font-family: 'Noto Sans Arabic', sans-serif;
  direction: rtl;
}
```

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile**: `<= 599.98px`
- **Tablet**: `600px - 1199.98px` (uses desktop layout)
- **Desktop**: `>= 1200px`

### Dynamic Layout Loading
```typescript
// Strategy pattern automatically selects correct component
const strategy = this.layoutStrategyService.getStrategy(this.layout);
this.layoutComponentRef = this.container.createComponent(strategy.component);
```

## 🔧 Configuration

### Admin Menu Configuration
```typescript
// config/admin-menu.config.ts
export const ADMIN_MENU_CONFIG: AdminMenuConfig = {
  collapsible: true,
  defaultCollapsed: false,
  items: [
    {
      id: 'dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/admin/dashboard',
      permissions: ['admin.dashboard.read']
    }
  ]
};
```

### Layout Strategy Registration
```typescript
// Register custom layout strategy
this.layoutStrategy.registerStrategy('custom', {
  component: CustomLayoutComponent,
  config: {
    type: 'custom',
    showHeader: true,
    showSidebar: false,
    showFooter: true
  }
});
```

## 🚀 Performance Features

### Lazy Loading
```typescript
// Components are loaded dynamically
export const LAYOUT_COMPONENTS = [
  LayoutComponent,
  ResponsiveLayoutComponent,
  AdminLayoutComponent
] as const;
```

### Optimized Resolution
```typescript
// Performance timing in resolver
const startTime = performance.now();
// ... resolution logic
const endTime = performance.now();
this.logger.debug(`Layout resolved in ${(endTime - startTime).toFixed(2)}ms`);
```

## 🧪 Testing

### Unit Tests
```bash
ng test --include="**/layout/**/*.spec.ts"
```

### Integration Tests
```typescript
// Test layout resolution
resolver.resolve(route, state).subscribe(result => {
  expect(result.resolution).toBe('mobile');
  expect(result.defaultLanguage).toBe('ro');
});
```

## 🔄 Migration Guide

### From Old Architecture
1. **Remove old modules**: Delete `DesktopModule`, `MobileModule`
2. **Update imports**: Use new `index.ts` barrel exports
3. **Update routes**: Use new `LayoutResolver` instead of old resolver
4. **Update templates**: Use new locale-aware pipes

### Route Configuration
```typescript
// Before
{
  path: '',
  component: LayoutComponent,
  resolve: { layoutResolver: LayoutResolver }
}

// After (same, but with improved resolver)
{
  path: '',
  component: LayoutComponent,
  resolve: { layoutResolver: LayoutResolver }
}
```

## 🎨 Styling Architecture

### CSS Custom Properties
```scss
:root {
  --footer-bg: #f8f9fa;
  --border-color: #dee2e6;
  --text-secondary: #666;
}

@media (prefers-color-scheme: dark) {
  :root {
    --footer-bg: #2d2d2d;
    --text-secondary: #ccc;
  }
}
```

### Responsive Classes
```scss
.layout-wrapper {
  &.with-sidebar {
    padding-left: 250px;
    
    @media (max-width: 768px) {
      padding-left: 0;
    }
  }
  
  &.rtl-sidebar {
    padding-right: 250px;
    padding-left: 0;
  }
}
```

## 📊 Monitoring & Debugging

### Logger Configuration
```typescript
// Development: All logs
// Production: Error only
const logger = new LayoutLoggerService();
logger.debug('Layout initialized', { layout, config });
```

### Performance Monitoring
```typescript
// Resolver includes timing information
{
  "layout": "mobile",
  "resolveTime": "12.45ms",
  "timestamp": "2024-08-24T17:00:00.000Z"
}
```

## 🤝 Contributing

1. All components should be standalone
2. Use strategy pattern for extensibility
3. Include comprehensive tests
4. Follow accessibility guidelines
5. Support RTL languages
6. Use environment-aware logging

## 📝 TODO

- [ ] Implement automatic query string translation
- [ ] Add animation presets for layout transitions
- [ ] Create visual regression tests
- [ ] Add accessibility audit automation
- [ ] Implement layout caching strategy