import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { toObservable, toSignal, rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { startWith, debounceTime, distinctUntilChanged, map, switchMap, of } from 'rxjs';
import { HojaRutaResponse, HojaRutaSimple, Seguimiento } from '../../interfaces/hojaRuta';
import { HojaRutaService } from '../../services/hojaRuta.service';
import { SeguimientosService } from '../../services/seguimientos.service';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Pagination } from '@shared/components/pagination/pagination';

@Component({
  selector: 'app-reports-hr',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, Pagination],
  templateUrl: './reportsHR.html',
  styleUrl: './reportsHR.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsHR {
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

  @ViewChild('modalPdfAsociados')
  modalPdfAsociados!: ElementRef<HTMLDialogElement>;

  pdfAsociadosUrl = signal<SafeResourceUrl | null>(null);
  pdfAsociadosLoading = signal(false);

  private pdfAsociadosBlobUrl: string | null = null;

   @ViewChild('modalPdfSeguimientos')
  modalPdfSeguimientos!: ElementRef<HTMLDialogElement>;

  pdfSeguimientosUrl = signal<SafeResourceUrl | null>(null);
  pdfSeguimientosLoading = signal(false);

  private pdfSeguimientosBlobUrl: string | null = null;

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

  hojaRutaPerPage = signal(20);
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

  


terminoGlobal = signal('');

buscarDesdeLayout(event: Event): void {
  event.preventDefault();

  const termino = this.terminoGlobal().trim();

  if (!termino) {
    return;
  }

  this.router.navigate(['/hojaRuta/report-hoja-ruta'], {
    queryParams: {
      termino,
      buscar: true,
      page: 1
    }
  });
}


constructor(
   private sanitizer: DomSanitizer,
) {
  this.route.queryParamMap.subscribe(params => {
    const termino = params.get('termino');
    const ejecutarBusqueda = params.get('buscar') === 'true';

    if (termino !== null && ejecutarBusqueda) {
      this.searchFormHR.patchValue(
        {
          termino,
          numero: ''
        },
        { emitEvent: false }
      );

      this.buscarTramite();
    }
  });
  
}

 //-----pint seguimientos---//

  printSeguimientos(hr: HojaRutaSimple) {

    // --------------------------------------------------
    // Limpiar PDF anterior
    // --------------------------------------------------
    this.limpiarPdfSeguimientos();

    // --------------------------------------------------
    // Mostrar loading
    // --------------------------------------------------
    this.pdfSeguimientosLoading.set(true);

    // --------------------------------------------------
    // Abrir modal
    // --------------------------------------------------
    const modal = this.modalPdfSeguimientos?.nativeElement;

    if (!modal) {
      console.error('No se encontró el modal de asociados',hr);
      console.error('No se encontró el modal de asociados');
      return;
    }

    modal.showModal();

    // --------------------------------------------------
    // Generar PDF
    // --------------------------------------------------
    this.hojaRutaService
      .printSeguimientos(hr._id)
      .subscribe({
        next: (blob: Blob) => {

          console.log('PDF recibido:', blob);
          console.log('Tamaño PDF:', blob.size);

          if (!blob || blob.size === 0) {
            console.error('El PDF está vacío');

            this.pdfSeguimientosLoading.set(false);

            Swal.fire(
              'Error',
              'El PDF generado está vacío.',
              'error'
            );

            this.closeModalPdfSeguimientos();

            return;
          }

          // ------------------------------------------------
          // Crear URL temporal
          // ------------------------------------------------
          this.pdfSeguimientosBlobUrl =
            window.URL.createObjectURL(blob);

          console.log(
            'URL PDF:',
            this.pdfSeguimientosBlobUrl
          );

          // ------------------------------------------------
          // Sanitizar URL
          // ------------------------------------------------
          const safeUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              this.pdfSeguimientosBlobUrl
            );

          // ------------------------------------------------
          // Actualizar signal
          // ------------------------------------------------
          this.pdfSeguimientosUrl.set(safeUrl);

          // ------------------------------------------------
          // Ocultar loading
          // ------------------------------------------------
          this.pdfSeguimientosLoading.set(false);
        },

        error: (error) => {

          console.error(
            'Error al generar PDF de asociados:',
            error
          );

          this.pdfSeguimientosLoading.set(false);

          Swal.fire(
            'Error',
            error?.error?.message ??
            'No se pudo generar el PDF de las hojas de ruta asociadas.',
            'error'
          );

          this.closeModalPdfSeguimientos();
        }
      });
  }
  closeModalPdfSeguimientos() {

    // --------------------------------------------------
    // Cerrar modal
    // --------------------------------------------------
    if (this.modalPdfSeguimientos?.nativeElement) {
      this.modalPdfSeguimientos.nativeElement.close();
    }

    // --------------------------------------------------
    // Limpiar PDF
    // --------------------------------------------------
    this.limpiarPdfSeguimientos();
  }
  private limpiarPdfSeguimientos() {

    // Quitar URL del iframe
    this.pdfSeguimientosUrl.set(null);

    // Ocultar loading
    this.pdfSeguimientosLoading.set(false);

    // Liberar Blob URL
    if (this.pdfSeguimientosBlobUrl) {

      window.URL.revokeObjectURL(
        this.pdfSeguimientosBlobUrl
      );

      this.pdfSeguimientosBlobUrl = null;
    }
  }


  printAsociados(hr: HojaRutaSimple) {
  
      // --------------------------------------------------
      // Limpiar PDF anterior
      // --------------------------------------------------
      this.limpiarPdfAsociados();
  
      // --------------------------------------------------
      // Mostrar loading
      // --------------------------------------------------
      this.pdfAsociadosLoading.set(true);
  
      // --------------------------------------------------
      // Abrir modal
      // --------------------------------------------------
      const modal = this.modalPdfAsociados?.nativeElement;
  
      if (!modal) {
        console.error('No se encontró el modal de asociados');
        return;
      }
  
      modal.showModal();
  
      // --------------------------------------------------
      // Generar PDF
      // --------------------------------------------------
      this.hojaRutaService
        .printAsociados(hr._id)
        .subscribe({
          next: (blob: Blob) => {
  
            console.log('PDF recibido:', blob);
            console.log('Tamaño PDF:', blob.size);
  
            if (!blob || blob.size === 0) {
              console.error('El PDF está vacío');
  
              this.pdfAsociadosLoading.set(false);
  
              Swal.fire(
                'Error',
                'El PDF generado está vacío.',
                'error'
              );
  
              this.closeModalPdfAsociados();
  
              return;
            }
  
            // ------------------------------------------------
            // Crear URL temporal
            // ------------------------------------------------
            this.pdfAsociadosBlobUrl =
              window.URL.createObjectURL(blob);
  
            console.log(
              'URL PDF:',
              this.pdfAsociadosBlobUrl
            );
  
            // ------------------------------------------------
            // Sanitizar URL
            // ------------------------------------------------
            const safeUrl =
              this.sanitizer.bypassSecurityTrustResourceUrl(
                this.pdfAsociadosBlobUrl
              );
  
            // ------------------------------------------------
            // Actualizar signal
            // ------------------------------------------------
            this.pdfAsociadosUrl.set(safeUrl);
  
            // ------------------------------------------------
            // Ocultar loading
            // ------------------------------------------------
            this.pdfAsociadosLoading.set(false);
          },
  
          error: (error) => {
  
            console.error(
              'Error al generar PDF de asociados:',
              error
            );
  
            this.pdfAsociadosLoading.set(false);
  
            Swal.fire(
              'Error',
              error?.error?.message ??
              'No se pudo generar el PDF de las hojas de ruta asociadas.',
              'error'
            );
  
            this.closeModalPdfAsociados();
          }
        });
    }
    closeModalPdfAsociados() {
  
      // --------------------------------------------------
      // Cerrar modal
      // --------------------------------------------------
      if (this.modalPdfAsociados?.nativeElement) {
        this.modalPdfAsociados.nativeElement.close();
      }
  
      // --------------------------------------------------
      // Limpiar PDF
      // --------------------------------------------------
      this.limpiarPdfAsociados();
    }
    private limpiarPdfAsociados() {
  
      // Quitar URL del iframe
      this.pdfAsociadosUrl.set(null);
  
      // Ocultar loading
      this.pdfAsociadosLoading.set(false);
  
      // Liberar Blob URL
      if (this.pdfAsociadosBlobUrl) {
  
        window.URL.revokeObjectURL(
          this.pdfAsociadosBlobUrl
        );
  
        this.pdfAsociadosBlobUrl = null;
      }
    }
}
