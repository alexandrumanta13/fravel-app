import { Routes } from '@angular/router';

export const bookingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./bookings-list/bookings-list.component').then(c => c.BookingsListComponent),
    data: { title: 'My Bookings' }
  },
  {
    path: ':id',
    loadComponent: () => 
      import('./booking-details/booking-details.component').then(c => c.BookingDetailsComponent),
    data: { title: 'Booking Details' }
  }
];