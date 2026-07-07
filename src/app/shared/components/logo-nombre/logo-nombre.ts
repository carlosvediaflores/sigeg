import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo-nombre',
  imports: [ RouterLink,],
  templateUrl: './logo-nombre.html',
  styleUrl: './logo-nombre.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoNombre {}
