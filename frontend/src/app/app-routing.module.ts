import { NgModule } from '@angular/core';
import {
  ExtraOptions,
  PreloadAllModules,
  RouterModule,
  Routes,
} from '@angular/router';
import { I18nResolverService } from './shared/components/i18n/i18n-resolver.service';
import { RoutesResolver } from './core/services/routes/routes.resolver';
import { LayoutComponent } from './layout/layout.component';

import { BookFlightResolver } from './modules/user/book-flight/services/book-flight.resolver';
import { FlightsResultsResolver } from './modules/user/flights-results/flights-results.resolver';
import { CompleteBookFlightResolver } from './modules/user/complete-book-flight/complete-book-flight.resolver';
import { LayoutResolver } from './layout/layout.resolver';
import { AdminLayoutComponent } from './layout/layouts/admin/admin.component';

const routerConfig: ExtraOptions = {
  preloadingStrategy: PreloadAllModules,
  scrollPositionRestoration: 'enabled',
};

export const routes: Routes = [
  // Redirect empty path to '/'
  // { path: '', pathMatch: 'full', redirectTo: '/' },

  // Landing routes
  {
    path: '',
    resolve: {
      layoutResolver: LayoutResolver,
    },
    data: { layout: 'mobile' },
    component: LayoutComponent,
    // children: [
    //   {
    //     path: '',
    //     resolve: [],
    //     loadChildren: () =>
    //       import('src/app/modules/user/book-flight/book-flight.module').then(
    //         (m) => m.BookFlightModule
    //       ),

    //     data: { preload: true },
    //   },
    //   // {
    //   //   path: 'bilete-avion',
    //   //   resolve: [BookFlightResolver],
    //   //   loadChildren: () => import('src/app/modules/user/book-flight/book-flight.module').then(m => m.BookFlightModule),
    //   //   data: { preload: true }
    //   // },
    //   {
    //     path: 'search/results',
    //     resolve: [FlightsResultsResolver],
    //     loadChildren: () =>
    //       import(
    //         'src/app/modules/user/flights-results/flights-results.module'
    //       ).then((m) => m.FlightsResultsModule),

    //     data: { preload: true },
    //   },
    //   {
    //     path: 'cautare/rezultate',
    //     resolve: [FlightsResultsResolver],
    //     loadChildren: () =>
    //       import(
    //         'src/app/modules/user/flights-results/flights-results.module'
    //       ).then((m) => m.FlightsResultsModule),
    //     data: { preload: true },
    //   },
    //   {
    //     path: 'rezerva-zbor',
    //     resolve: [CompleteBookFlightResolver],
    //     loadChildren: () =>
    //       import(
    //         'src/app/modules/user/complete-book-flight/complete-book-flight.module'
    //       ).then((m) => m.CompleteBookFlightModule),
    //     data: { preload: true },
    //   },
    //   {
    //     path: 'complete-book-flight',
    //     resolve: [CompleteBookFlightResolver],
    //     loadChildren: () =>
    //       import(
    //         'src/app/modules/user/complete-book-flight/complete-book-flight.module'
    //       ).then((m) => m.CompleteBookFlightModule),
    //     data: { preload: true },
    //   },
    // ],
  },
  { path: '', component: AdminLayoutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerConfig)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
