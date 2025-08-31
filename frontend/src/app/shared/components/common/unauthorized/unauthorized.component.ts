import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p>Please contact an administrator if you believe this is an error.</p>
        <div class="actions">
          <a routerLink="/" class="btn-primary">Go Home</a>
          <a routerLink="/login" class="btn-secondary">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      padding: 20px;
    }

    .unauthorized-content {
      text-align: center;
      max-width: 500px;

      .icon {
        color: #dc3545;
        margin-bottom: 24px;
      }

      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 16px 0;
      }

      p {
        color: #666;
        margin: 0 0 8px 0;
        line-height: 1.6;
      }

      .actions {
        margin-top: 32px;
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #667eea;
          color: white;

          &:hover {
            background: #5a67d8;
          }
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 1px solid #667eea;

          &:hover {
            background: #667eea;
            color: white;
          }
        }
      }
    }
  `],
  imports: [CommonModule, RouterModule],
})
export class UnauthorizedComponent {}