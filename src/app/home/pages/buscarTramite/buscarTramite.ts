import { DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { HojaRutaResponse, HojaRutaSimple, Seguimiento } from '../../../modules/hojaRuta/interfaces/hojaRuta';
import { HojaRutaService } from '../../../modules/hojaRuta/services/hojaRuta.service';
import { SeguimientosService } from '../../../modules/hojaRuta/services/seguimientos.service';
import { startWith, debounceTime, distinctUntilChanged, combineLatest, map, switchMap, tap, of } from 'rxjs';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-buscar-tramite',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, ],
  templateUrl: './buscarTramite.html',
  styleUrl: './buscarTramite.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuscarTramite {
  hojaRutaService = inject(HojaRutaService);
  seguimientosService = inject(SeguimientosService);
  public hojaRutas = signal<HojaRutaResponse[] | null>(null);
  hojaRuta = signal<HojaRutaSimple | null>(null);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  router = inject(Router);
  selectedHrId = signal('');
  selectedHrId$ = toObservable(this.selectedHrId);
  selectedNumeroCopia = signal(0);

  hojaRutaResource = signal<any | null>(null);
  cargando = signal(false);

  year = new Date().getFullYear();
  mostrarResultados = signal(false);
  searchFormHR = this.fb.group({
    gestion: [this.year],
    termino: [''],
    numero: [''],
  });

  searchFormHR$ = this.searchFormHR.valueChanges.pipe(
    startWith(this.searchFormHR.value),
    debounceTime(300),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  currentPage = toSignal(
    this.route.queryParamMap.pipe(

      map((params) =>
        params.get('page')
          ? +params.get('page')!
          : 1
      ),

      map((page) =>
        isNaN(page)
          ? 1
          : page
      )
    ),
    {
      initialValue: 1,
    }
  );

  hojaRutaPerPage = signal(10);
  currentPage$ = toObservable(this.currentPage);

  hojaRutaPerPage$ =
    toObservable(this.hojaRutaPerPage);



  selectedHrResource = rxResource({
    stream: () =>
      this.selectedHrId$.pipe(
        switchMap(id =>
          id
            ? this.hojaRutaService.getHojaRuta(id)
            : of(null)
        )
      )
  });

  getTiempoPendiente(fecha: string | Date): string {

    const inicio = new Date(fecha).getTime();
    const ahora = Date.now();

    const diff = ahora - inicio;

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${dias}d ${horas}h ${minutos}m`;
  }
  seguimientosAgrupados = computed(() => {
    const hr = this.selectedHrResource.value();

    if (!hr) return [];

    const grupos = new Map<number, Seguimiento[]>();

    for (const seg of hr.seguimientos) {
      const copia = seg.numeroCopia ?? 0;

      if (!grupos.has(copia)) {
        grupos.set(copia, []);
      }

      grupos.get(copia)!.push(seg);
    }

    return [...grupos.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([numeroCopia, seguimientos]) => ({
        numeroCopia,
        titulo: numeroCopia === 0
          ? 'Oficial'
          : `Copia ${numeroCopia}`,
        seguimientos
      }));
  });

  seguimientosActuales = computed(() => {
    const grupo = this.seguimientosAgrupados()
      .find(g => g.numeroCopia === this.selectedNumeroCopia());

    return grupo?.seguimientos ?? [];
  });

  limpiarBusqueda() {
  this.searchFormHR.reset({
    termino: '',
    numero: '',
    gestion: this.year
  });

  // limpiar resultados
  this.hojaRutaResource.set(null);

  // ocultar modal si estuviera abierto
  this.selectedHrId.set('');

  // opcional: limpiar selección
  this.selectedNumeroCopia.set(0);
}

  puedeBuscar(): boolean {
  const { numero, termino } = this.searchFormHR.value;

  return !!(
    numero ||
    termino?.trim()
  );
}

  buscarTramite() {

    const values = this.searchFormHR.value;


    const params = {

      limit: this.hojaRutaPerPage(),

      offset:
        (this.currentPage() - 1)
        *
        this.hojaRutaPerPage(),


      gestion:
        Number(values.gestion),


      ...(values.numero && {
        numero:
          Number(values.numero)
      }),


      ...(values.termino?.trim() && {
        termino:
          values.termino.trim()
      })

    };


    console.log('PARAMS BUSQUEDA', params);


    this.cargando.set(true);


    this.hojaRutaService
      .getHojaRutas(params)

      .subscribe({

        next: (data) => {


          console.log('RESPUESTA HR', data);
          this.hojaRutaResource
            .set(data);
          this.cargando
            .set(false);
        },
        error: (err) => {
          console.error(
            'ERROR BUSCAR HR',
            err
          );
          this.hojaRutaResource
            .set(null);
          this.cargando
            .set(false);


        }


      });


  }

  openSeguiModal(hojaRuta: HojaRutaSimple) {

    console.log('Hoja de Ruta seleccionada', hojaRuta);

    this.selectedHrId.set(hojaRuta._id);

    const modal = document.getElementById(
      'segui_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  closeDialog(event: MouseEvent) {

    const dialog = event.currentTarget as HTMLDialogElement;
    const box = dialog.querySelector('.modal-box');

    if (!box) return;

    const rect = box.getBoundingClientRect();

    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) {
      dialog.close();
    }
  }

}
