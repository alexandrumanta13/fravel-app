import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-settings',
  template: `
    <div class="admin-settings">
      <div class="page-header">
        <h1>System Settings</h1>
      </div>

      <div class="settings-sections">
        <div class="settings-card">
          <h3>General Settings</h3>
          <div class="settings-form">
            <div class="form-group">
              <label>Site Title</label>
              <input type="text" [(ngModel)]="settings.siteTitle" class="form-control">
            </div>
            <div class="form-group">
              <label>Default Language</label>
              <select [(ngModel)]="settings.defaultLanguage" class="form-control">
                <option value="en">English</option>
                <option value="ro">Romanian</option>
              </select>
            </div>
            <div class="form-group">
              <label>Default Currency</label>
              <select [(ngModel)]="settings.defaultCurrency" class="form-control">
                <option value="EUR">EUR</option>
                <option value="RON">RON</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <h3>Email Settings</h3>
          <div class="settings-form">
            <div class="form-group">
              <label>SMTP Host</label>
              <input type="text" [(ngModel)]="settings.smtpHost" class="form-control">
            </div>
            <div class="form-group">
              <label>SMTP Port</label>
              <input type="number" [(ngModel)]="settings.smtpPort" class="form-control">
            </div>
            <div class="form-group">
              <label>From Email</label>
              <input type="email" [(ngModel)]="settings.fromEmail" class="form-control">
            </div>
          </div>
        </div>

        <div class="settings-card">
          <h3>Booking Settings</h3>
          <div class="settings-form">
            <div class="form-group">
              <label>Cancellation Period (hours)</label>
              <input type="number" [(ngModel)]="settings.cancellationHours" class="form-control">
            </div>
            <div class="form-group">
              <label>Max Passengers per Booking</label>
              <input type="number" [(ngModel)]="settings.maxPassengers" class="form-control">
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="settings.autoConfirmBookings">
                Auto-confirm bookings
              </label>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <h3>API Settings</h3>
          <div class="settings-form">
            <div class="form-group">
              <label>Travel Fusion API Key</label>
              <input type="password" [(ngModel)]="settings.travelFusionApiKey" class="form-control">
            </div>
            <div class="form-group">
              <label>Kiwi API Key</label>
              <input type="password" [(ngModel)]="settings.kiwiApiKey" class="form-control">
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="settings.enableApiLogging">
                Enable API request logging
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn-secondary" (click)="resetSettings()">Reset to Default</button>
        <button class="btn-primary" (click)="saveSettings()">Save Changes</button>
      </div>
    </div>
  `,
  styleUrls: ['./admin-settings.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AdminSettingsComponent {
  settings = {
    siteTitle: 'Fravel - Flight Booking',
    defaultLanguage: 'en',
    defaultCurrency: 'EUR',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    fromEmail: 'noreply@fravel.com',
    cancellationHours: 24,
    maxPassengers: 9,
    autoConfirmBookings: false,
    travelFusionApiKey: '**********************',
    kiwiApiKey: '**********************',
    enableApiLogging: true
  };

  saveSettings(): void {
    console.log('Saving settings:', this.settings);
    // Implement save logic
  }

  resetSettings(): void {
    // Reset to default values
    console.log('Resetting settings to default');
  }
}