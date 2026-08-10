import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HeroSlider } from '../../components/heroSlider/heroSlider';
import { BuscarTramite } from '../buscarTramite/buscarTramite';

@Component({
  selector: 'app-home-page',
  imports: [HeroSlider, BuscarTramite ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
   mostrarBuscarTramite = signal(false);


  abrirBusqueda() {
    this.mostrarBuscarTramite.set(true);

    // bajar automáticamente al componente
    setTimeout(() => {
      document
        .getElementById('buscar-tramite')
        ?.scrollIntoView({
          behavior: 'smooth'
        });
    }, 100);
  }
}
