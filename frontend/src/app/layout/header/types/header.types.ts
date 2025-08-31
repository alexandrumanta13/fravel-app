import { Language } from '../../../core/types';

export interface HeaderState {
  isMenuOpen: boolean;
  isLanguageMenuOpen: boolean;
  isStepperVisible: boolean;
  currentStep: number;
  selectedLanguage: Language;
}

export interface HeaderConfig {
  showLogo: boolean;
  showLanguageSelector: boolean;
  showMenu: boolean;
  showStepper: boolean;
  logoUrl: string;
  logoAlt: string;
  isSticky: boolean;
  theme: 'light' | 'dark' | 'transparent';
}

export interface MenuAction {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  action?: () => void;
  visible: boolean;
  disabled?: boolean;
}

export interface LanguageOption {
  language: Language;
  isActive: boolean;
  isAvailable: boolean;
}

export interface StepperStep {
  id: number;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
  isClickable: boolean;
}