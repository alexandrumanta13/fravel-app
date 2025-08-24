import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassangersComponent } from './passangers.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    PassangersComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [PassangersComponent],
})
export class PassangersModule { }
