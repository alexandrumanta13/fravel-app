// Layout Module and Services
export { LayoutModule } from './layout.module';

// Main Layout Component
export { LayoutComponent } from './layout.component';

// Layout Types
export * from './layout.types';
export * from './types/layout-resolver.types';

// Layout Services
export { LayoutResolver } from './resolvers/layout.resolver';
export { LayoutStrategyService } from './services/layout-strategy.service';
export { LocaleLayoutService } from './services/locale-layout.service';
export { LayoutLoggerService } from './services/layout-logger.service';

// Layout Components
export { ResponsiveLayoutComponent } from './layouts/responsive/responsive-layout.component';
export { AdminLayoutComponent } from './layouts/admin/admin.component';
export { BaseLayoutComponent } from './layouts/base/base-layout.component';

// Layout Configuration
export * from './config/admin-menu.config';

// Layout Pipes
export * from './pipes/locale-format.pipe';

// Re-export for convenience
import { LayoutComponent } from './layout.component';
import { ResponsiveLayoutComponent } from './layouts/responsive/responsive-layout.component';
import { AdminLayoutComponent } from './layouts/admin/admin.component';

// Standalone Layout Components for lazy loading
export const LAYOUT_COMPONENTS = [
  LayoutComponent,
  ResponsiveLayoutComponent,
  AdminLayoutComponent
] as const;