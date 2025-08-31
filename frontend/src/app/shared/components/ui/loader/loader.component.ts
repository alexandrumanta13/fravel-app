import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  computed,
  signal,
  effect,
  input
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { LoaderService } from './loader.service';

// Types for better type safety
interface LoaderConfig {
  showProgress: boolean;
  showPercentage: boolean;
  animationType: 'plane' | 'spinner' | 'pulse';
  theme: 'light' | 'dark' | 'branded';
  size: 'small' | 'medium' | 'large';
  message?: string;
  overlay: boolean;
}

interface LoaderState {
  isVisible: boolean;
  progress: number;
  message: string;
  isComplete: boolean;
}

@Component({
  standalone: true,
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [CommonModule]
})
export class LoaderComponent implements OnInit, OnDestroy {
  // Input configuration
  config = input<Partial<LoaderConfig>>();
  
  // Reactive state management
  private readonly _isVisible = signal(false);
  private readonly _progress = signal(0);
  private readonly _message = signal('');
  private readonly _isComplete = signal(false);
  
  // Default configuration
  private readonly _defaultConfig = signal<LoaderConfig>({
    showProgress: true,
    showPercentage: true,
    animationType: 'plane',
    theme: 'branded',
    size: 'medium',
    message: 'Loading...',
    overlay: true
  });
  
  // Computed properties
  readonly isVisible = computed(() => this._isVisible());
  readonly progress = computed(() => this._progress());
  readonly message = computed(() => this._message() || this.loaderConfig().message || 'Loading...');
  readonly isComplete = computed(() => this._isComplete());
  readonly progressPercentage = computed(() => `${Math.round(this._progress())}%`);
  readonly shouldShowProgress = computed(() => this.loaderConfig().showProgress);
  readonly shouldShowPercentage = computed(() => this.loaderConfig().showPercentage);
  
  // Configuration computed
  readonly loaderConfig = computed(() => ({
    ...this._defaultConfig(),
    ...this.config()
  }));
  
  // CSS classes computed
  readonly containerClasses = computed(() => {
    const config = this.loaderConfig();
    const classes = ['loader'];
    
    classes.push(`loader--${config.theme}`);
    classes.push(`loader--${config.size}`);
    classes.push(`loader--${config.animationType}`);
    
    if (config.overlay) classes.push('loader--overlay');
    if (this.isComplete()) classes.push('loader--complete');
    if (this._progress() > 0) classes.push('loader--progress');
    
    return classes.join(' ');
  });
  
  readonly loaderState = computed((): LoaderState => ({
    isVisible: this._isVisible(),
    progress: this._progress(),
    message: this.message(),
    isComplete: this._isComplete()
  }));
  
  private readonly destroy$ = new Subject<void>();

  constructor(
    private loaderService: LoaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Setup reactive effects
    if (isPlatformBrowser(this.platformId)) {
      // Watch loader service state changes
      effect(() => {
        const serviceState = this.loaderService.state();
        this._isVisible.set(serviceState.isVisible);
        this._progress.set(serviceState.progress);
        this._message.set(serviceState.message);
        this._isComplete.set(serviceState.progress >= 100);
      });
    }
  }

  ngOnInit(): void {
    // Apply input configuration
    const inputConfig = this.config();
    if (inputConfig?.message) {
      this._message.set(inputConfig.message);
    }
    
    // Initialize loader state from service
    if (isPlatformBrowser(this.platformId)) {
      this._isVisible.set(this.loaderService.isVisible());
      this._progress.set(this.loaderService.progress());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Public methods for external control
  show(message?: string): void {
    if (message) {
      this._message.set(message);
    }
    this.loaderService.show(message);
  }
  
  hide(): void {
    this.loaderService.hide();
  }
  
  setProgress(progress: number, message?: string): void {
    this.loaderService.setProgress(progress);
    if (message) {
      this.loaderService.setMessage(message);
    }
  }
  
  // Animation event handlers
  onAnimationComplete(): void {
    if (this.isComplete()) {
      // Delay hiding to show completion state
      setTimeout(() => {
        this.hide();
      }, 800);
    }
  }
  
  // Accessibility helpers
  getAriaLabel(): string {
    const config = this.loaderConfig();
    if (config.showPercentage && this.progress() > 0) {
      return `${this.message()} ${this.progressPercentage()}`;
    }
    return this.message();
  }
  
  getAriaValueText(): string {
    if (this.shouldShowProgress()) {
      return `Loading progress: ${this.progressPercentage()}`;
    }
    return this.message();
  }
}