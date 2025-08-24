import { Routes } from '@angular/router';
import { LayoutResolver } from './layout/layout.resolver';
import { BookFlightComponent } from './modules/user/book-flight/book-flight.component';
export const routes: Routes = [
  {
    path: '',
    resolve: {
      layoutResolver: LayoutResolver,
    },

    data: { layout: 'mobile' },
    loadComponent: () =>
      import('./layout/layout.component').then((c) => c.LayoutComponent),
    children: [
      {
        path: '',
        resolve: [],
        loadComponent: () =>
          import('./features/flight-booking/pages/book-flight/book-flight.component').then(
            (c) => c.BookFlightComponent
          ),
      },
      {
        path: 'cauta-zbor',
        resolve: [],
        loadComponent: () =>
          import('./features/flight-booking/pages/book-flight/book-flight.component').then(
            (c) => c.BookFlightComponent
          ),
      },
      {
        path: 'search-flight',
        resolve: [],
        loadComponent: () =>
          import('./features/flight-booking/pages/book-flight/book-flight.component').then(
            (c) => c.BookFlightComponent
          ),
      },
      // {
      //   path: 'lista-zboruri',
      //   resolve: [],
      //   loadComponent: () =>
      //     import(
      //       './modules/user/flights-results/flights-results.component'
      //     ).then((c) => c.FlightsResultsComponent),
      // },
      // {
      //   path: 'flights-results',
      //   resolve: [],
      //   loadComponent: () =>
      //     import(
      //       './modules/user/flights-results/flights-results.component'
      //     ).then((c) => c.FlightsResultsComponent),
      // },
    ],
  },
];
