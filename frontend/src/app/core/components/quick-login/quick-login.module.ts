import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickLoginComponent } from './quick-login.component';



@NgModule({
  declarations: [
    QuickLoginComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [QuickLoginComponent]
})
export class QuickLoginModule { }
