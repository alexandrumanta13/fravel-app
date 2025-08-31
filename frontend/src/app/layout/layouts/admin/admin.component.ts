import { Component, OnInit, Inject, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SharedService } from '../../../shared/shared.service';
import { BaseLayoutComponent } from '../base/base-layout.component';
import { LayoutConfig } from '../../layout.types';
import { ADMIN_MENU_CONFIG, AdminMenuItem } from '../../config/admin-menu.config';
import { LayoutLoggerService } from '../../services/layout-logger.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class AdminLayoutComponent extends BaseLayoutComponent {
  @Input() config?: LayoutConfig;
  
  sidebarCollapsed = ADMIN_MENU_CONFIG.defaultCollapsed;
  adminMenuItems: AdminMenuItem[] = ADMIN_MENU_CONFIG.items;

  constructor(
    sharedService: SharedService,
    breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) platformId: Object,
    private logger: LayoutLoggerService
  ) {
    super(sharedService, breakpointObserver, platformId);
  }

  protected onLayoutInit(): void {
    // Admin-specific initialization
    this.filterVisibleMenuItems();
    this.logger.debug('Admin layout initialized', {
      visibleMenuItems: this.getVisibleMenuItems().length,
      sidebarCollapsed: this.sidebarCollapsed,
      config: this.config
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private filterVisibleMenuItems(): void {
    // Filter menu items based on permissions and visibility
    this.adminMenuItems = this.adminMenuItems.filter(item => 
      item.visible !== false && this.hasPermission(item.permissions)
    );
  }

  private hasPermission(permissions?: string[]): boolean {
    // TODO: Implement actual permission check
    // For now, return true - integrate with your auth service
    return !permissions || permissions.length === 0 || true;
  }

  getVisibleMenuItems(): AdminMenuItem[] {
    return this.adminMenuItems.filter(item => item.visible !== false);
  }
}
