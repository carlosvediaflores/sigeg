import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-app-page',
  imports: [RouterLink],
  templateUrl: './app-page.html',
  styleUrl: './app-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPage {
  authService = inject(AuthService);

  user = computed(() => this.authService.user());
}
