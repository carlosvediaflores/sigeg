import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-home-nav-gamb',
  imports: [RouterLink],
  templateUrl: './home-nav-gamb.html',
  styleUrl: './home-nav-gamb.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavGamb {
  authService = inject(AuthService);
}
