import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-bookings-management',
  template: `
    <div class="bookings-management">
      <div class="page-header">
        <h1>Bookings Management</h1>
        <div class="header-stats">
          <span class="stat">Total: {{ totalBookings }}</span>
          <span class="stat">Pending: {{ pendingBookings }}</span>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search bookings..." 
            [(ngModel)]="searchTerm"
            (input)="filterBookings()">
        </div>
        <div class="filter-controls">
          <select [(ngModel)]="selectedStatus" (change)="filterBookings()">
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input 
            type="date" 
            [(ngModel)]="dateFrom" 
            (change)="filterBookings()"
            placeholder="From Date">
        </div>
      </div>

      <div class="bookings-table">
        <div class="table-header">
          <span>Booking ID</span>
          <span>Passenger</span>
          <span>Flight</span>
          <span>Date</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Actions</span>
        </div>
        <div class="table-row" *ngFor="let booking of filteredBookings">
          <span class="booking-id">{{ booking.id }}</span>
          <span>{{ booking.passengerName }}</span>
          <span>{{ booking.flightNumber }}</span>
          <span>{{ booking.flightDate | date:'medium' }}</span>
          <span class="status" [class]="booking.status">{{ booking.status }}</span>
          <span class="amount">{{ booking.amount | currency:'EUR' }}</span>
          <div class="actions">
            <button class="btn-sm btn-outline" (click)="viewBooking(booking)">View</button>
            <button 
              class="btn-sm"
              [class]="booking.status === 'confirmed' ? 'btn-warning' : 'btn-success'"
              (click)="toggleBookingStatus(booking)">
              {{ booking.status === 'confirmed' ? 'Cancel' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>

      <div class="pagination">
        <span>Showing {{ filteredBookings.length }} of {{ totalBookings }} bookings</span>
      </div>
    </div>
  `,
  styleUrls: ['./bookings-management.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class BookingsManagementComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  searchTerm = '';
  selectedStatus = '';
  dateFrom = '';
  totalBookings = 0;
  pendingBookings = 0;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    // Mock data - replace with actual service call
    this.bookings = [
      {
        id: 'BK001',
        passengerName: 'John Doe',
        flightNumber: 'RO142',
        flightDate: new Date('2024-02-15T10:30:00'),
        status: 'confirmed',
        amount: 299,
        bookingDate: new Date()
      },
      {
        id: 'BK002',
        passengerName: 'Maria Popescu',
        flightNumber: 'LH1234',
        flightDate: new Date('2024-02-20T14:15:00'),
        status: 'pending',
        amount: 456,
        bookingDate: new Date()
      },
      {
        id: 'BK003',
        passengerName: 'Alex Smith',
        flightNumber: 'BA567',
        flightDate: new Date('2024-02-25T08:45:00'),
        status: 'cancelled',
        amount: 678,
        bookingDate: new Date()
      }
    ];
    
    this.filteredBookings = [...this.bookings];
    this.totalBookings = this.bookings.length;
    this.pendingBookings = this.bookings.filter(b => b.status === 'pending').length;
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      const matchesSearch = !this.searchTerm || 
        booking.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.passengerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.flightNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || booking.status === this.selectedStatus;
      
      const matchesDate = !this.dateFrom || 
        new Date(booking.flightDate) >= new Date(this.dateFrom);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  viewBooking(booking: any): void {
    console.log('View booking:', booking);
  }

  toggleBookingStatus(booking: any): void {
    if (booking.status === 'confirmed') {
      booking.status = 'cancelled';
    } else if (booking.status === 'pending') {
      booking.status = 'confirmed';
    }
    this.filterBookings();
  }
}