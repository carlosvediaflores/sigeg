import { UpperCasePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UpperCasePipe, TitleCasePipe,],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLayout {

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
