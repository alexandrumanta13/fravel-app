import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminStatsService } from '../services/admin-stats.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0
  };

  recentBookings: any[] = [];
  isLoading = true;

  constructor(private adminStatsService: AdminStatsService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.adminStatsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });

    this.adminStatsService.getRecentBookings(5).subscribe({
      next: (bookings) => {
        this.recentBookings = bookings;
      },
      error: (error) => {
        console.error('Error loading recent bookings:', error);
      }
    });
  }
}