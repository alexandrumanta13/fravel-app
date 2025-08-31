import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
}

export interface RecentBooking {
  id: string;
  userName: string;
  flightNumber: string;
  bookingDate: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {
  private apiUrl = `${environment.apiUrl || 'http://localhost:3000'}/api/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getRecentBookings(limit: number = 10): Observable<RecentBooking[]> {
    return this.http.get<RecentBooking[]>(`${this.apiUrl}/bookings/recent?limit=${limit}`);
  }

  // Mock data for development - remove when backend is ready
  getMockStats(): Observable<AdminStats> {
    return of({
      totalUsers: 1247,
      totalBookings: 856,
      totalRevenue: 125340,
      pendingBookings: 23
    });
  }

  getMockRecentBookings(): Observable<RecentBooking[]> {
    return of([
      {
        id: '1',
        userName: 'John Doe',
        flightNumber: 'RO142',
        bookingDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'confirmed',
        amount: 299
      },
      {
        id: '2',
        userName: 'Maria Popescu',
        flightNumber: 'LH1234',
        bookingDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
        status: 'pending',
        amount: 456
      },
      {
        id: '3',
        userName: 'Alex Smith',
        flightNumber: 'BA567',
        bookingDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
        status: 'confirmed',
        amount: 678
      }
    ]);
  }
}