import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { HeroSlide } from '../../interfaces/hero-slide.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-slider',
  imports: [RouterLink],
  templateUrl: './heroSlider.html',
  styleUrl: './heroSlider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSlider {
   

  @Output()
  abrirBusqueda = new EventEmitter<void>();
}
