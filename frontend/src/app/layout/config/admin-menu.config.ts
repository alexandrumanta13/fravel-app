export interface AdminMenuItem {
  id: string;
  icon: string;
  label: string;
  route: string;
  badge?: string | number;
  children?: AdminMenuItem[];
  permissions?: string[];
  visible?: boolean;
}

export interface AdminMenuConfig {
  items: AdminMenuItem[];
  collapsible: boolean;
  defaultCollapsed: boolean;
}

export const ADMIN_MENU_CONFIG: AdminMenuConfig = {
  collapsible: true,
  defaultCollapsed: false,
  items: [
    {
      id: 'dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/admin/dashboard',
      visible: true
    },
    {
      id: 'users',
      icon: 'users',
      label: 'Users',
      route: '/admin/users',
      permissions: ['admin.users.read'],
      visible: true
    },
    {
      id: 'bookings',
      icon: 'bookings',
      label: 'Bookings',
      route: '/admin/bookings',
      permissions: ['admin.bookings.read'],
      visible: true
    },
    {
      id: 'analytics',
      icon: 'analytics',
      label: 'Analytics',
      route: '/admin/analytics',
      permissions: ['admin.analytics.read'],
      visible: true
    },
    {
      id: 'settings',
      icon: 'settings',
      label: 'Settings',
      route: '/admin/settings',
      permissions: ['admin.settings.read'],
      children: [
        {
          id: 'general',
          icon: 'tune',
          label: 'General',
          route: '/admin/settings/general',
          permissions: ['admin.settings.general'],
          visible: true
        },
        {
          id: 'integrations',
          icon: 'integration_instructions',
          label: 'Integrations',
          route: '/admin/settings/integrations',
          permissions: ['admin.settings.integrations'],
          visible: true
        }
      ],
      visible: true
    }
  ]
};