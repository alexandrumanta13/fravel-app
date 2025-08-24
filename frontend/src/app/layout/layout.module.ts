import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout.component';

import { AdminModule } from './layouts/admin/admin.module';
import { SharedModule } from '../shared/shared.module';
import { DesktopModule } from './layouts/desktop/desktop.module';
import { MobileModule } from './layouts/mobile/mobile.module';
import { CommonModule } from '@angular/common';

const layoutModules: any = [MobileModule, AdminModule, DesktopModule];

@NgModule({
  declarations: [LayoutComponent],
  imports: [CommonModule, ...layoutModules],
  exports: [LayoutComponent, ...layoutModules],
})
export class LayoutModule {}
