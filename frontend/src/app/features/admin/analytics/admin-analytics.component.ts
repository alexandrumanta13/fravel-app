import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-analytics',
  template: `
    <div class="admin-analytics">
      <div class="page-header">
        <h1>Analytics Dashboard</h1>
        <div class="time-filters">
          <button 
            class="filter-btn" 
            [class.active]="selectedPeriod === '7d'"
            (click)="setPeriod('7d')">7 Days</button>
          <button 
            class="filter-btn" 
            [class.active]="selectedPeriod === '30d'"
            (click)="setPeriod('30d')">30 Days</button>
          <button 
            class="filter-btn" 
            [class.active]="selectedPeriod === '90d'"
            (click)="setPeriod('90d')">90 Days</button>
        </div>
      </div>

      <div class="analytics-grid">
        <div class="chart-card">
          <h3>Bookings Trend</h3>
          <div class="chart-placeholder">
            <p>Chart showing bookings over time</p>
            <div class="mock-chart">
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-bar" style="height: 80%"></div>
              <div class="chart-bar" style="height: 45%"></div>
              <div class="chart-bar" style="height: 90%"></div>
              <div class="chart-bar" style="height: 70%"></div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Revenue by Destination</h3>
          <div class="chart-placeholder">
            <div class="destination-stats">
              <div class="destination-item">
                <span class="destination">London</span>
                <span class="revenue">€12,450</span>
              </div>
              <div class="destination-item">
                <span class="destination">Barcelona</span>
                <span class="revenue">€8,920</span>
              </div>
              <div class="destination-item">
                <span class="destination">Milan</span>
                <span class="revenue">€6,780</span>
              </div>
              <div class="destination-item">
                <span class="destination">Rome</span>
                <span class="revenue">€5,340</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>User Growth</h3>
          <div class="chart-placeholder">
            <div class="growth-stats">
              <div class="stat">
                <span class="label">New Users</span>
                <span class="value">+45</span>
                <span class="change positive">↑ 12%</span>
              </div>
              <div class="stat">
                <span class="label">Active Users</span>
                <span class="value">1,247</span>
                <span class="change positive">↑ 8%</span>
              </div>
              <div class="stat">
                <span class="label">Retention Rate</span>
                <span class="value">74%</span>
                <span class="change negative">↓ 2%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Popular Routes</h3>
          <div class="chart-placeholder">
            <div class="routes-list">
              <div class="route-item">
                <span class="route">Bucharest → London</span>
                <span class="count">156 bookings</span>
              </div>
              <div class="route-item">
                <span class="route">Bucharest → Barcelona</span>
                <span class="count">134 bookings</span>
              </div>
              <div class="route-item">
                <span class="route">Bucharest → Milan</span>
                <span class="count">98 bookings</span>
              </div>
              <div class="route-item">
                <span class="route">Bucharest → Rome</span>
                <span class="count">87 bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-analytics.component.scss'],
  imports: [CommonModule]
})
export class AdminAnalyticsComponent implements OnInit {
  selectedPeriod = '30d';

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadAnalyticsData();
  }

  private loadAnalyticsData(): void {
    console.log('Loading analytics data for period:', this.selectedPeriod);
    // Load analytics data based on selected period
  }
}