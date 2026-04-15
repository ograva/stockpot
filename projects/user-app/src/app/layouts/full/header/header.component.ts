import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  inject,
  computed,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CoreService } from 'src/app/services/core.service';

const DEFAULT_AVATAR = '/assets/images/profile/user-1.jpg';

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
  private core = inject(CoreService);

  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  readonly displayName = computed(
    () => this.core.currentUser()?.displayName ?? '',
  );
  readonly avatarUrl = computed(
    () => this.core.currentUser()?.photoURL || DEFAULT_AVATAR,
  );
}
