import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

// Base routes without language prefix (for English as default)
const baseRoutes: Routes = [
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  },
  {
    path: 'search', // EN: search
    loadComponent: () => 
      import('./features/flight-booking/pages/flights-results/flights-results.component')
        .then(c => c.FlightsResultsComponent),
    data: { title: 'Search Flights', originalPath: 'search' }
  },
  {
    path: 'login', // EN: login
    loadComponent: () => 
      import('./features/auth/login/login.component').then(c => c.LoginComponent),
    data: { title: 'Sign In', originalPath: 'login' }
  },
  {
    path: 'signup', // EN: signup
    loadComponent: () => 
      import('./features/auth/signup/signup.component').then(c => c.SignupComponent),
    data: { title: 'Sign Up', originalPath: 'signup' }
  },
  {
    path: 'book-flight/:id', // EN: book-flight
    loadComponent: () => 
      import('./features/flight-booking/pages/book-flight/book-flight.component')
        .then(c => c.BookFlightComponent),
    data: { title: 'Book Flight', originalPath: 'book-flight' }
  },
  {
    path: 'profile', // EN: profile
    canActivate: [AuthGuard],
    loadComponent: () => 
      import('./features/user/profile/profile.component').then(c => c.ProfileComponent),
    data: { title: 'Profile', originalPath: 'profile' }
  },
  {
    path: 'bookings', // EN: bookings
    canActivate: [AuthGuard],
    loadChildren: () => 
      import('./features/user/bookings/bookings.routes').then(r => r.bookingsRoutes),
    data: { title: 'My Bookings', originalPath: 'bookings' }
  },
  {
    path: 'complete-booking/:id', // EN: complete-booking
    canActivate: [AuthGuard],
    loadComponent: () => 
      import('./features/flight-booking/pages/complete-book-flight/complete-book-flight.component')
        .then(c => c.CompleteBookFlightComponent),
    data: { title: 'Complete Booking', originalPath: 'complete-booking' }
  },
  {
    path: 'admin', // EN: admin
    canActivate: [AdminGuard],
    loadChildren: () => 
      import('./features/admin/admin.routes').then(r => r.adminRoutes),
    data: { title: 'Admin Panel', originalPath: 'admin' }
  },
  {
    path: 'unauthorized', // EN: unauthorized
    loadComponent: () => 
      import('./shared/components/common/unauthorized/unauthorized.component')
        .then(c => c.UnauthorizedComponent),
    data: { title: 'Unauthorized', originalPath: 'unauthorized' }
  },
  {
    path: 'terms', // EN: terms
    loadComponent: () => 
      import('./shared/components/common/terms/terms.component')
        .then(c => c.TermsComponent),
    data: { title: 'Terms of Service', originalPath: 'terms' }
  },
  {
    path: 'privacy', // EN: privacy
    loadComponent: () => 
      import('./shared/components/common/privacy/privacy.component')
        .then(c => c.PrivacyComponent),
    data: { title: 'Privacy Policy', originalPath: 'privacy' }
  }
];

// Romanian routes with language prefix
const romanianRoutes: Routes = [
  {
    path: '',
    redirectTo: '/ro/cautare',
    pathMatch: 'full'
  },
  {
    path: 'cautare', // RO: cautare (search)
    loadComponent: () => 
      import('./features/flight-booking/pages/flights-results/flights-results.component')
        .then(c => c.FlightsResultsComponent),
    data: { title: 'Cautare Zboruri', originalPath: 'search', language: 'ro' }
  },
  {
    path: 'autentificare', // RO: autentificare (login)
    loadComponent: () => 
      import('./features/auth/login/login.component').then(c => c.LoginComponent),
    data: { title: 'Autentificare', originalPath: 'login', language: 'ro' }
  },
  {
    path: 'inregistrare', // RO: inregistrare (signup)
    loadComponent: () => 
      import('./features/auth/signup/signup.component').then(c => c.SignupComponent),
    data: { title: 'Inregistrare', originalPath: 'signup', language: 'ro' }
  },
  {
    path: 'rezervare-zbor/:id', // RO: rezervare-zbor (book-flight)
    loadComponent: () => 
      import('./features/flight-booking/pages/book-flight/book-flight.component')
        .then(c => c.BookFlightComponent),
    data: { title: 'Rezervare Zbor', originalPath: 'book-flight', language: 'ro' }
  },
  {
    path: 'profil', // RO: profil (profile)
    canActivate: [AuthGuard],
    loadComponent: () => 
      import('./features/user/profile/profile.component').then(c => c.ProfileComponent),
    data: { title: 'Profil', originalPath: 'profile', language: 'ro' }
  },
  {
    path: 'rezervari', // RO: rezervari (bookings)
    canActivate: [AuthGuard],
    loadChildren: () => 
      import('./features/user/bookings/bookings.routes').then(r => r.bookingsRoutes),
    data: { title: 'Rezervarile Mele', originalPath: 'bookings', language: 'ro' }
  },
  {
    path: 'finalizare-rezervare/:id', // RO: finalizare-rezervare (complete-booking)
    canActivate: [AuthGuard],
    loadComponent: () => 
      import('./features/flight-booking/pages/complete-book-flight/complete-book-flight.component')
        .then(c => c.CompleteBookFlightComponent),
    data: { title: 'Finalizare Rezervare', originalPath: 'complete-booking', language: 'ro' }
  },
  {
    path: 'admin', // RO: admin (same as EN)
    canActivate: [AdminGuard],
    loadChildren: () => 
      import('./features/admin/admin.routes').then(r => r.adminRoutes),
    data: { title: 'Panou Admin', originalPath: 'admin', language: 'ro' }
  },
  {
    path: 'neautorizat', // RO: neautorizat (unauthorized)
    loadComponent: () => 
      import('./shared/components/common/unauthorized/unauthorized.component')
        .then(c => c.UnauthorizedComponent),
    data: { title: 'Neautorizat', originalPath: 'unauthorized', language: 'ro' }
  },
  {
    path: 'termeni', // RO: termeni (terms)
    loadComponent: () => 
      import('./shared/components/common/terms/terms.component')
        .then(c => c.TermsComponent),
    data: { title: 'Termeni si Conditii', originalPath: 'terms', language: 'ro' }
  },
  {
    path: 'confidentialitate', // RO: confidentialitate (privacy)
    loadComponent: () => 
      import('./shared/components/common/privacy/privacy.component')
        .then(c => c.PrivacyComponent),
    data: { title: 'Politica de Confidentialitate', originalPath: 'privacy', language: 'ro' }
  }
];

// Combined i18n routes
export const i18nRoutes: Routes = [
  // Default language (English) routes - no prefix
  ...baseRoutes,
  
  // Romanian routes with 'ro' prefix
  {
    path: 'ro',
    children: romanianRoutes,
    data: { language: 'ro' }
  },
  
  // Catch all - 404
  {
    path: '**',
    loadComponent: () => 
      import('./shared/components/common/not-found/not-found.component')
        .then(c => c.NotFoundComponent),
    data: { title: 'Page Not Found' }
  }
];