import { UpperCasePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { LogoNombre } from '@shared/components/logo-nombre/logo-nombre';
import { Profile } from '@shared/components/profile/profile';

@Component({
  selector: 'app-hoja-ruta-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive,  LogoNombre, Profile],
  templateUrl: './hoja-ruta-layout.html',
  styleUrl: './hoja-ruta-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HojaRutaLayout {
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
