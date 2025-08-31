import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { QuickLoginService } from './quick-login.service';

@Component({
  standalone: true,
  selector: 'app-quick-login',
  templateUrl: './quick-login.component.html',
  styleUrls: ['./quick-login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class QuickLoginComponent implements OnInit, OnDestroy {
  quickLoginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  isOpen = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private quickLoginService: QuickLoginService,
    private router: Router
  ) {
    this.quickLoginForm = this.createQuickLoginForm();
  }

  ngOnInit(): void {
    // Listen to auth state and quick login service
    combineLatest([
      this.authService.currentUser$,
      this.quickLoginService.isQuickLoginOpen$
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([user, isQuickLoginOpen]) => {
        this.currentUser = user;
        this.isOpen = isQuickLoginOpen && !user; // Don't show if user is logged in
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createQuickLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleQuickLogin(): void {
    if (this.currentUser) {
      // If user is logged in, navigate to profile
      this.router.navigate(['/profile']);
    } else {
      this.quickLoginService.toggleQuickLogin();
      if (this.isOpen) {
        this.resetForm();
      }
    }
  }

  closeQuickLogin(): void {
    this.quickLoginService.closeQuickLogin();
    this.resetForm();
  }

  onSubmit(): void {
    if (this.quickLoginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.quickLoginForm.value;

      this.authService.login({ email, password })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Quick login successful:', response);
            this.closeQuickLogin();
            
            // Check if user is admin and redirect accordingly
            if (response.user.role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              // Stay on current page or redirect to profile
              this.router.navigate(['/profile']);
            }
          },
          error: (error) => {
            console.error('Quick login error:', error);
            this.errorMessage = error.error?.message || 'Invalid email or password';
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToSignup(): void {
    this.closeQuickLogin();
    this.router.navigate(['/signup']);
  }

  navigateToFullLogin(): void {
    this.closeQuickLogin();
    this.router.navigate(['/login']);
  }

  private resetForm(): void {
    this.quickLoginForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
    this.showPassword = false;
  }

  getFieldError(fieldName: string): string {
    const field = this.quickLoginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }
}
