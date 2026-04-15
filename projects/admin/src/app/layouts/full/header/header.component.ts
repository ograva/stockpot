import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Auth, signOut } from '@angular/fire/auth';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  private auth = inject(Auth);
  private router = inject(Router);
  readonly core = inject(CoreService);

  get authStatus() {
    return this.core.authStatus();
  }

  get userInitial(): string {
    const user = this.core.currentUser();
    if (!user) return '?';
    return (user.displayName ?? user.email ?? '?')[0].toUpperCase();
  }

  get userPhotoURL(): string | null {
    return this.core.currentUser()?.photoURL ?? null;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/authentication/login']);
  }
}
