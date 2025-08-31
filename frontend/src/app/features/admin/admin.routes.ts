import { Routes } from '@angular/router';
import { AdminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
        data: { title: 'Dashboard' }
      },
      {
        path: 'users',
        loadComponent: () => 
          import('./users/users-management.component').then(c => c.UsersManagementComponent),
        data: { title: 'Users Management' }
      },
      {
        path: 'bookings',
        loadComponent: () => 
          import('./bookings/bookings-management.component').then(c => c.BookingsManagementComponent),
        data: { title: 'Bookings Management' }
      },
      {
        path: 'analytics',
        loadComponent: () => 
          import('./analytics/admin-analytics.component').then(c => c.AdminAnalyticsComponent),
        data: { title: 'Analytics' }
      },
      {
        path: 'settings',
        loadComponent: () => 
          import('./settings/admin-settings.component').then(c => c.AdminSettingsComponent),
        data: { title: 'Settings' }
      }
    ]
  }
];