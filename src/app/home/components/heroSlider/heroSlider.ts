import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HeroSlide } from '../../interfaces/hero-slide.interface';

@Component({
  selector: 'app-hero-slider',
  imports: [],
  templateUrl: './heroSlider.html',
  styleUrl: './heroSlider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSlider {
   slides = signal<HeroSlide[]>([
    {
      id: 1,
      titulo: 'Bienvenidos al Gobierno Autónomo Municipal de Ckochas',
      subtitulo: 'Trabajando por el desarrollo del municipio',
      descripcion:
        'Conozca nuestras obras, servicios, noticias y atractivos turísticos.',
      imagen: 'assets/images/hero/ckochas.jpg',
      botonTexto: 'Conocer más',
      botonRuta: '/institucion',
    },
    {
      id: 2,
      titulo: 'Descubra nuestros atractivos turísticos',
      subtitulo: 'Naturaleza, cultura e historia',
      descripcion:
        'Visite los principales destinos turísticos del municipio.',
      imagen: 'assets/images/hero/banner-2.jpg',
      botonTexto: 'Ver Turismo',
      botonRuta: '/turismo',
    },
    {
      id: 3,
      titulo: 'Transparencia Institucional',
      subtitulo: 'Información pública al alcance de todos',
      descripcion:
        'Consulte documentos, rendiciones de cuentas y normativa municipal.',
      imagen: 'assets/images/hero/banner-3.jpg',
      botonTexto: 'Transparencia',
      botonRuta: '/transparencia',
    }
  ]);
}
