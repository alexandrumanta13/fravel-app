import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightsResultsComponent } from './flights-results.component';


const routes: Routes = [
  { path: '', component: FlightsResultsComponent, data: { title: 'results title' } },
  { path: 'cautare/rezultate/:flights', component: FlightsResultsComponent, data: { title: 'results' } },
  { path: 'search/results/:flights', component: FlightsResultsComponent, data: { title: 'results' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightsResultRoutingModule { }
