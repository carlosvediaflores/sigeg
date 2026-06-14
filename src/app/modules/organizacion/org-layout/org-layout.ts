import { UpperCasePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-org-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UpperCasePipe, TitleCasePipe,],
  templateUrl: './org-layout.html',
  styleUrl: './org-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgLayout {
   sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

   authService = inject(AuthService);

  user = computed(() => this.authService.user());

}
