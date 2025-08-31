import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SharedService } from '../../../shared/shared.service';
import { BaseLayoutComponent } from '../base/base-layout.component';
import { MobileLayoutComponent } from '../mobile/mobile.component';
import { DesktopLayoutComponent } from '../desktop/desktop.component';
import { LayoutLoggerService } from '../../services/layout-logger.service';

@Component({
  standalone: true,
  selector: 'app-responsive-layout',
  template: `
    <app-mobile-layout *ngIf="layoutState.isMobile"></app-mobile-layout>
    <app-desktop-layout *ngIf="layoutState.isDesktop || layoutState.isTablet"></app-desktop-layout>
  `,
  imports: [
    CommonModule,
    MobileLayoutComponent,
    DesktopLayoutComponent,
  ],
})
export class ResponsiveLayoutComponent extends BaseLayoutComponent {
  constructor(
    sharedService: SharedService,
    breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) platformId: Object,
    private logger: LayoutLoggerService
  ) {
    super(sharedService, breakpointObserver, platformId);
  }

  protected onLayoutInit(): void {
    // Responsive layout initialization
    this.logger.debug('Responsive layout initialized', {
      isMobile: this.layoutState.isMobile,
      isTablet: this.layoutState.isTablet,
      isDesktop: this.layoutState.isDesktop
    });
  }
}