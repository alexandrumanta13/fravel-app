import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './admin.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AdminLayoutComponent],
  imports: [RouterModule],
  exports: [AdminLayoutComponent],
})
export class AdminModule {}
