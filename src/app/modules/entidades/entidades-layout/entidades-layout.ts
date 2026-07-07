import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { LogoNombre } from '@shared/components/logo-nombre/logo-nombre';
import { Profile } from '@shared/components/profile/profile';

@Component({
  selector: 'app-entidades-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive,  LogoNombre, Profile],
  templateUrl: './entidades-layout.html',
  styleUrl: './entidades-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntidadesLayout {
  sidebarOpen = signal(true);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  authService = inject(AuthService);

  user = computed(() => this.authService.user());
}
