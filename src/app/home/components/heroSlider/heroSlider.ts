import { ChangeDetectionStrategy, Component, OnDestroy, output, signal, } from '@angular/core';
import { HeroSlide } from '../../interfaces/hero-slide.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-slider',
  imports: [],
  templateUrl: './heroSlider.html',
  styleUrl: './heroSlider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSlider implements OnDestroy {

  

  // ==========================================
  // EVENTO BUSCAR TRÁMITE
  // ==========================================

  buscarTramite = output<void>();


  // ==========================================
  // SLIDES
  // ==========================================

  slides = signal<HeroSlide[]>([

    {
      id: 1,

      titulo: 'Gobierno Autónomo Municipal de Ckochas',

      subtitulo: 'Portal Web Institucional',

      descripcion:
        'Comprometidos con el desarrollo, la transparencia y el bienestar de nuestra población.',

      imagen:
        'assets/images/hero/slider1.jpg',

      botonTexto:
        'Conocer el Municipio',

      botonRuta:
        '/historia'
    },


    {
      id: 2,

      titulo:
        'Trabajamos por nuestro Municipio',

      subtitulo:
        'Gestión Municipal 2026 - 2031',

      descripcion:
        'Construyendo un municipio con oportunidades, participación ciudadana y desarrollo sostenible.',

      imagen:
        'assets/images/hero/slider2.jpg',

      botonTexto:
        'Conocer nuestra gestión',

      botonRuta:
        '/alcalde'
    },


    {
      id: 3,

       titulo: 'Gobierno Autónomo Municipal de Ckochas',

      subtitulo: 'Portal Web Institucional',

      descripcion:
        'Comprometidos con el desarrollo, la transparencia y el bienestar de nuestra población.',

      imagen:
        'assets/images/hero/slider3.jpg',

      botonTexto:
        'Ver Gaceta Municipal',

      botonRuta:
        '/gaceta'
    }

  ]);



  // ==========================================
  // SLIDE ACTUAL
  // ==========================================

  slideActual = signal(0);



  // ==========================================
  // INTERVALO
  // ==========================================

  private intervalo: ReturnType<typeof setInterval>;



  constructor() {

    this.intervalo = setInterval(() => {

      this.siguiente();

    }, 6000);

  }



  // ==========================================
  // SIGUIENTE
  // ==========================================

  siguiente() {

    this.slideActual.update(index => {

      const siguiente =
        index + 1;

      return siguiente >= this.slides().length
        ? 0
        : siguiente;

    });

  }



  // ==========================================
  // ANTERIOR
  // ==========================================

  anterior() {

    this.slideActual.update(index => {

      const anterior =
        index - 1;

      return anterior < 0
        ? this.slides().length - 1
        : anterior;

    });

  }



  // ==========================================
  // IR A SLIDE
  // ==========================================

  irA(index: number) {

    this.slideActual.set(index);

  }



  // ==========================================
  // BUSCAR TRÁMITE
  // ==========================================

  activarBusqueda() {

    this.buscarTramite.emit();

  }



  // ==========================================
  // DESTROY
  // ==========================================

  ngOnDestroy() {

    clearInterval(this.intervalo);

  }

}
