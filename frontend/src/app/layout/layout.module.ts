import { NgModule } from '@angular/core';

// Services that need to be provided at module level
import { LayoutResolver } from './resolvers/layout.resolver';
import { LayoutStrategyService } from './services/layout-strategy.service';
import { LocaleLayoutService } from './services/locale-layout.service';
import { LayoutLoggerService } from './services/layout-logger.service';

/**
 * Layout Module for providing layout-related services
 * Note: Components are now standalone and don't need to be declared here
 */
@NgModule({
  providers: [
    LayoutResolver,
    LayoutStrategyService,
    LocaleLayoutService,
    LayoutLoggerService
  ],
  // No declarations needed - components are standalone
  // No imports needed - components handle their own imports
  // Export services for potential external use
})
export class LayoutModule {
  // Optional: Add static forRoot() method for configuration
  static forRoot() {
    return {
      ngModule: LayoutModule,
      providers: [
        LayoutResolver,
        LayoutStrategyService,
        LocaleLayoutService,
        LayoutLoggerService
      ]
    };
  }
}
