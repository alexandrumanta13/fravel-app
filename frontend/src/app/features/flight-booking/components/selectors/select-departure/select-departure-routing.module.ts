import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutesResolver } from 'src/app/core/services/routes/routes.resolver';
import { SelectDepartureComponent } from './select-departure.component';

const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    component: SelectDepartureComponent,
    data: { title: 'asdsad' },
    resolve: [RoutesResolver],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelectDepartureRoutingModule { }
