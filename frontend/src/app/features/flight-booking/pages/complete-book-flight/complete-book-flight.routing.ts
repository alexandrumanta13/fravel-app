import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompleteBookFlightComponent } from './complete-book-flight.component';


const routes: Routes = [
  { path: '', component: CompleteBookFlightComponent, data: { title: 'results title' } },
  { path: 'rezerva-zbor/:flights', component: CompleteBookFlightComponent, data: { title: 'results' } },
  { path: 'complete-book-flight/:flights', component: CompleteBookFlightComponent, data: { title: 'results' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompleteBookFlightRoutingModule { }
