import { Injectable, Type } from '@angular/core';
import { Layout, LayoutConfig, ResponsiveLayout, ApplicationLayout } from '../layout.types';
import { ResponsiveLayoutComponent } from '../layouts/responsive/responsive-layout.component';
import { AdminLayoutComponent } from '../layouts/admin/admin.component';

export interface LayoutStrategy {
  component: Type<any>;
  config: LayoutConfig;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutStrategyService {
  private strategies = new Map<Layout, LayoutStrategy>();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // Admin layout strategy
    this.strategies.set('admin', {
      component: AdminLayoutComponent,
      config: {
        type: 'admin',
        responsive: 'desktop',
        application: 'admin',
        showHeader: false,
        showSidebar: true,
        showFooter: false
      }
    });

    // User responsive layouts
    ['mobile', 'tablet', 'desktop'].forEach((layout) => {
      this.strategies.set(layout as Layout, {
        component: ResponsiveLayoutComponent,
        config: {
          type: layout as Layout,
          responsive: layout as ResponsiveLayout,
          application: 'user',
          showHeader: true,
          showSidebar: false,
          showFooter: true
        }
      });
    });

    // Guest layout (same as user but different permissions)
    this.strategies.set('guest', {
      component: ResponsiveLayoutComponent,
      config: {
        type: 'guest',
        responsive: 'desktop',
        application: 'guest',
        showHeader: true,
        showSidebar: false,
        showFooter: true
      }
    });
  }

  getStrategy(layout: Layout): LayoutStrategy {
    const strategy = this.strategies.get(layout);
    
    if (!strategy) {
      // Fallback to responsive layout
      return this.strategies.get('desktop') || this.getDefaultStrategy();
    }
    
    return strategy;
  }

  private getDefaultStrategy(): LayoutStrategy {
    return {
      component: ResponsiveLayoutComponent,
      config: {
        type: 'desktop',
        responsive: 'desktop',
        application: 'guest',
        showHeader: true,
        showSidebar: false,
        showFooter: true
      }
    };
  }

  getAllStrategies(): Map<Layout, LayoutStrategy> {
    return new Map(this.strategies);
  }

  registerStrategy(layout: Layout, strategy: LayoutStrategy): void {
    this.strategies.set(layout, strategy);
  }
}