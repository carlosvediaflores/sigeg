import { ChangeDetectionStrategy, Component, output, } from '@angular/core';
import { HeroSlide } from '../../interfaces/hero-slide.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-slider',
  imports: [],
  templateUrl: './heroSlider.html',
  styleUrl: './heroSlider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSlider {

   buscarTramite = output<void>();

  activarBusqueda() {
    this.buscarTramite.emit();
  }

}
