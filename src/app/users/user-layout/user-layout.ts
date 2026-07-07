import { UpperCasePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { LogoNombre } from '@shared/components/logo-nombre/logo-nombre';
import { Profile } from '@shared/components/profile/profile';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive,  LogoNombre, Profile],
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
