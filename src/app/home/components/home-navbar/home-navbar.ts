import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-home-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './home-navbar.html',
  styleUrl: './home-navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbar {
  authService = inject(AuthService);

  
    menuMobile = false;


    institucional = false;

    transparencia = false;

    cerrarMenuMobile() {

    this.menuMobile = false;

    // opcional: cerrar submenús
    this.institucional = false;
    this.transparencia = false;

}
}
