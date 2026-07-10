import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-home-navbar',
  imports: [RouterLink,],
  templateUrl: './home-navbar.html',
  styleUrl: './home-navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbar {
  authService = inject(AuthService);
}
