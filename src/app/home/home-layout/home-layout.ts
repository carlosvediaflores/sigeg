import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { HomeNavbar } from '../components/home-navbar/home-navbar';
import { Topbar } from '../components/topbar/topbar';
import { Footer } from '../components/footer/footer';

@Component({
  selector: 'app-home-layout',
  imports: [ RouterOutlet, HomeNavbar, Topbar, Footer],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLayout {
  authService = inject(AuthService);
}
