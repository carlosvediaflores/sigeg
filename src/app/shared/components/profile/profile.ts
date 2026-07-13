import { UpperCasePipe, TitleCasePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [ UpperCasePipe, TitleCasePipe,],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  authService = inject(AuthService);

  user = computed(() => this.authService.user());
}
