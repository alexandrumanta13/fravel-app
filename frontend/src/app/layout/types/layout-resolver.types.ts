import { Layout } from '../layout.types';

export interface LayoutResolverData {
  gdpr: boolean;
  resolution: Layout;
  defaultLanguage: string;
  locale?: string;
  timestamp: number;
}

export interface ConsentStatus {
  hasConsent: boolean;
  consentKey: string;
  lastChecked?: Date;
}

export interface BreakpointResolution {
  layout: Layout;
  screenWidth?: number;
  screenHeight?: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface LanguageResolution {
  key: string;
  locale: string;
  isConsistent: boolean;
  urlLanguage?: string;
}