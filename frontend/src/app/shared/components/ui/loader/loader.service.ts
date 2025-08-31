import { Injectable, Inject, PLATFORM_ID, signal, computed, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, interval, finalize, takeUntil, tap, startWith } from 'rxjs';

// Types for better type safety
interface LoaderProgressConfig {
  endProgress: number;
  duration: number;
  easing?: 'linear' | 'ease-out' | 'ease-in-out';
}

interface LoaderServiceState {
  isVisible: boolean;
  progress: number;
  isActive: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  // Private signals for state management
  private readonly _isVisible = signal(false);
  private readonly _progress = signal(0);
  private readonly _message = signal('');
  private readonly _isActive = signal(false);
  
  // Public computed properties for external consumption
  readonly isVisible = computed(() => this._isVisible());
  readonly progress = computed(() => this._progress());
  readonly message = computed(() => this._message());
  readonly isActive = computed(() => this._isActive());
  readonly isComplete = computed(() => this._progress() >= 100);
  
  // Combined state for convenience
  readonly state = computed((): LoaderServiceState => ({
    isVisible: this._isVisible(),
    progress: this._progress(),
    isActive: this._isActive(),
    message: this._message()
  }));
  
  // Legacy BehaviorSubjects for backward compatibility
  // These will be deprecated in future versions
  readonly loader$ = new Subject<boolean>();
  readonly loadingProgress$ = new Subject<number>();
  
  private readonly destroy$ = new Subject<void>();
  private progressIntervalId?: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Setup reactive effects to maintain compatibility with existing BehaviorSubject API
    if (isPlatformBrowser(this.platformId)) {
      // Sync signals with legacy observables
      effect(() => {
        this.loader$.next(this._isVisible());
      });
      
      effect(() => {
        this.loadingProgress$.next(this._progress());
      });
      
      // Auto-hide loader when progress reaches 100%
      effect(() => {
        if (this.isComplete() && this._isVisible()) {
          setTimeout(() => {
            this.hide();
          }, 800);
        }
      });
    }
  }

  // Modern signal-based API
  show(message?: string): void {
    if (message) {
      this._message.set(message);
    }
    this._isVisible.set(true);
    this._isActive.set(true);
  }
  
  hide(): void {
    this._isVisible.set(false);
    this._isActive.set(false);
    this.stopProgressAnimation();
  }
  
  setMessage(message: string): void {
    this._message.set(message);
  }
  
  setProgress(progress: number): void {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    this._progress.set(clampedProgress);
  }
  
  resetProgress(): void {
    this._progress.set(0);
    this.stopProgressAnimation();
  }
  
  startProgressAnimation(config: LoaderProgressConfig): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.stopProgressAnimation();
    
    const { endProgress, duration, easing = 'linear' } = config;
    const startProgress = this._progress();
    const progressDiff = endProgress - startProgress;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progressRatio = Math.min(elapsedTime / duration, 1);
      
      // Apply easing function
      let easedRatio: number;
      switch (easing) {
        case 'ease-out':
          easedRatio = 1 - Math.pow(1 - progressRatio, 2);
          break;
        case 'ease-in-out':
          easedRatio = progressRatio < 0.5 
            ? 2 * progressRatio * progressRatio 
            : 1 - Math.pow(-2 * progressRatio + 2, 2) / 2;
          break;
        default:
          easedRatio = progressRatio;
      }
      
      const currentProgress = startProgress + (progressDiff * easedRatio);
      this._progress.set(Math.round(currentProgress));
      
      if (progressRatio < 1) {
        this.progressIntervalId = requestAnimationFrame(animate);
      } else {
        this._progress.set(endProgress);
        this.progressIntervalId = undefined;
      }
    };
    
    this.progressIntervalId = requestAnimationFrame(animate);
  }
  
  private stopProgressAnimation(): void {
    if (this.progressIntervalId) {
      cancelAnimationFrame(this.progressIntervalId);
      this.progressIntervalId = undefined;
    }
  }

  // Legacy API methods for backward compatibility
  // These methods delegate to the modern signal-based API
  
  /**
   * @deprecated Use show() instead
   */
  setLoaderState(state: boolean): void {
    if (state) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * @deprecated Use startProgressAnimation() instead
   */
  setLoaderProgress(endProgress: number, duration: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.startProgressAnimation({
      endProgress,
      duration,
      easing: 'linear'
    });
  }

  /**
   * @deprecated Use stopProgressAnimation() instead
   */
  stopLoaderProgress(): void {
    this.stopProgressAnimation();
  }
  
  // Utility methods
  showWithProgress(message: string, targetProgress: number, duration: number = 2000): void {
    this.show(message);
    this.startProgressAnimation({
      endProgress: targetProgress,
      duration,
      easing: 'ease-out'
    });
  }
  
  simulateLoading(steps: Array<{ message: string; progress: number; duration: number }>): Promise<void> {
    return new Promise((resolve) => {
      let currentStepIndex = 0;
      
      const executeStep = () => {
        if (currentStepIndex >= steps.length) {
          resolve();
          return;
        }
        
        const step = steps[currentStepIndex];
        this.setMessage(step.message);
        
        this.startProgressAnimation({
          endProgress: step.progress,
          duration: step.duration,
          easing: 'ease-out'
        });
        
        setTimeout(() => {
          currentStepIndex++;
          executeStep();
        }, step.duration + 100); // Small delay between steps
      };
      
      this.show();
      executeStep();
    });
  }
  
  // Cleanup method
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopProgressAnimation();
    this.loader$.complete();
    this.loadingProgress$.complete();
  }
}