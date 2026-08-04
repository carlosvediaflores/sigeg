import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSlider } from '../../components/heroSlider/heroSlider';
import { BuscarTramite } from '../../components/buscarTramite/buscarTramite';

@Component({
  selector: 'app-home-page',
  imports: [HeroSlider, BuscarTramite],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
