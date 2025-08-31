import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SharedService } from '../../../shared/shared.service';
import { BaseLayoutComponent } from '../base/base-layout.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/ui/sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-desktop-layout',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  imports: [
    RouterModule,
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
})
export class DesktopLayoutComponent extends BaseLayoutComponent {
  constructor(
    sharedService: SharedService,
    breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(sharedService, breakpointObserver, platformId);
  }

  protected onLayoutInit(): void {
    // Desktop-specific initialization logic
    this.sharedService.updateUiStatesObjFn([
      { toggleMenu: false }, // Desktop doesn't need mobile menu
      { toggleFilter: false }
    ]);
  }
}