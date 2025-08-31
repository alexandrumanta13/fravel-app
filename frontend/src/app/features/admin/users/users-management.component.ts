import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-users-management',
  template: `
    <div class="users-management">
      <div class="page-header">
        <h1>Users Management</h1>
        <button class="btn-primary">Add New User</button>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search users..." 
            [(ngModel)]="searchTerm"
            (input)="filterUsers()">
        </div>
        <div class="filter-controls">
          <select [(ngModel)]="selectedRole" (change)="filterUsers()">
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div class="users-table">
        <div class="table-header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Registered</span>
          <span>Actions</span>
        </div>
        <div class="table-row" *ngFor="let user of filteredUsers">
          <span>{{ user.firstName }} {{ user.lastName }}</span>
          <span>{{ user.email }}</span>
          <span class="role" [class]="user.role">{{ user.role }}</span>
          <span class="status" [class]="user.status">{{ user.status }}</span>
          <span>{{ user.createdAt | date:'short' }}</span>
          <div class="actions">
            <button class="btn-sm btn-outline" (click)="editUser(user)">Edit</button>
            <button class="btn-sm btn-danger" (click)="deactivateUser(user)">
              {{ user.status === 'active' ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>

      <div class="pagination">
        <span>Showing {{ filteredUsers.length }} of {{ totalUsers }} users</span>
      </div>
    </div>
  `,
  styleUrls: ['./users-management.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class UsersManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm = '';
  selectedRole = '';
  totalUsers = 0;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Mock data - replace with actual service call
    this.users = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'user', status: 'active', createdAt: new Date() },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'admin', status: 'active', createdAt: new Date() },
      { id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', role: 'user', status: 'inactive', createdAt: new Date() }
    ];
    this.filteredUsers = [...this.users];
    this.totalUsers = this.users.length;
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }

  editUser(user: any): void {
    console.log('Edit user:', user);
  }

  deactivateUser(user: any): void {
    console.log('Toggle user status:', user);
  }
}