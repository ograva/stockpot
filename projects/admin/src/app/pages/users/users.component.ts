import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { UsersService, AppUser } from '../../services/users.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, MaterialModule, TablerIconsModule],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private router = inject(Router);
  private usersService = inject(UsersService);

  readonly searchTerm = signal('');
  readonly displayedColumns = ['name', 'email', 'role', 'createdAt', 'actions'];

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.usersService.users();
    if (!term) return all;
    return all.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term),
    );
  });

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  navigateToNew(): void {
    this.router.navigate(['/dashboard/users/new']);
  }

  navigateToEdit(uid: string): void {
    this.router.navigate(['/dashboard/users', uid, 'edit']);
  }
}
