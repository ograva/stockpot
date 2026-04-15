import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MaterialModule, RouterModule, TablerIconsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly core = inject(CoreService);

  get displayName(): string {
    const user = this.core.currentUser();
    return user?.displayName ?? user?.email?.split('@')[0] ?? 'there';
  }
}
