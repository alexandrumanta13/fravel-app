// Core layout types for responsive design
export type ResponsiveLayout = 'mobile' | 'tablet' | 'desktop';

// Application layout types
export type ApplicationLayout = 'admin' | 'user' | 'guest';

// Theme/Style variants (future use)
export type LayoutVariant = 
  | 'centered'
  | 'enterprise' 
  | 'material'
  | 'modern'
  | 'classy'
  | 'compact'
  | 'dense'
  | 'futuristic'
  | 'thin';

// Combined layout type
export type Layout = ResponsiveLayout | ApplicationLayout | LayoutVariant | 'empty';

// Layout configuration interface
export interface LayoutConfig {
  type: Layout;
  responsive: ResponsiveLayout;
  application: ApplicationLayout;
  variant?: LayoutVariant;
  showHeader: boolean;
  showSidebar: boolean;
  showFooter: boolean;
}

// Layout state interface
export interface LayoutState {
  toggleFilter: boolean;
  toggleMenu: boolean;
  toggleDeparture: boolean;
  toggleDestination: boolean;
  toggleSelectPersons: boolean;
  toggleSelectDate: boolean;
  toggleSearchFlight: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
