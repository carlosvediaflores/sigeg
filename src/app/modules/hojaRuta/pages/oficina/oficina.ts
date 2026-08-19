import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, tap, combineLatest, switchMap, firstValueFrom, of, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { UserService } from '../../../../users/services/user.service';
import { HojaRutaService } from '../../services/hojaRuta.service';
import { SeguimientosService } from '../../services/seguimientos.service';
import { DatePipe, JsonPipe } from '@angular/common';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { Pagination } from '@shared/components/pagination/pagination';
import { HojaRutaSimple, Seguimiento } from '../../interfaces/hojaRuta';
import Swal from 'sweetalert2';
import { AuthService } from '@auth/services/auth.service';
import { OrgService } from '../../../organizacion/services/org.service';

@Component({
  selector: 'app-oficina',
  imports: [RouterLink, Pagination, DatePipe, ReactiveFormsModule, FormErrorLabel,],
  templateUrl: './oficina.html',
  styleUrl: './oficina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Oficina {
  activatedRoute = inject(ActivatedRoute);
  authService = inject(AuthService);
  private orgService = inject(OrgService);
  user = computed(() => this.authService.user());
  wasSaved = signal(false);
  successMessage = signal('');
  isPosting = signal(false);
  seguiId = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['id'])
    ),
    {
      initialValue: '',
    }
  );

  selectedOrg = signal<any | null>(null);
  selectedUnidad = signal<any | null>(null);
  selectedSubUnidad = signal<any | null>(null);
  seguimientos = signal<Seguimiento | null>(null);
  seguiId$ = toObservable(this.seguiId);
  selectedSeguiId = signal('');
  selectedNumeroCopia = signal(0);
  selectedSeguiId$ = toObservable(this.selectedSeguiId);
  selectedHrId = signal('');
  selectedHrId$ = toObservable(this.selectedHrId);
  hojaRutaService = inject(HojaRutaService);
  userService = inject(UserService);
  seguimientosService = inject(SeguimientosService);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  year = new Date().getFullYear();

  selectedSeguimientos = signal<Seguimiento[]>([]);
  seguimientoOficial = signal<Seguimiento | null>(null);


  pendientesRecepcion = computed(() =>
    this.seguimientosResource.value()?.pendientesRecepcion ?? []
  );

  totalPendientesRecepcion = computed(() =>
    this.seguimientosResource.value()?.totalPendientesRecepcion ?? 0
  );

  bloquearPagina = computed(() =>
    this.totalPendientesRecepcion() > 0
  );

  searchFormSegui = this.fb.group({
    gestion: [this.year],
    termino: [''],
    estado: [''],
    numeroHr: [''],
    destinoUser: [this.user()?._id ?? ''],
    idUnidadOrgDest: [this.user()?.idUnidadOrg?._id ?? ''],
    idUnidadFuncDest: [this.user()?.idUnidadFuncional?._id ?? ''],
    idSubUnidadDest: [this.user()?.idSubUnidad?._id ?? ''],
  });

  searchFormSegui$ = this.searchFormSegui.valueChanges.pipe(
    debounceTime(300),
    startWith(this.searchFormSegui.getRawValue())
  );

  usersResource = rxResource({
    stream: () => this.userService.getUsers({ limit: 1000 })
      .pipe(tap((resp) => console.log('Users', resp))),
  });

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
  seguimientosPerPage = signal(10);
  currentPage$ = toObservable(this.currentPage);

  seguimientosPerPage$ =
    toObservable(this.seguimientosPerPage);

  seguimientosResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.seguimientosPerPage$,
        this.searchFormSegui$,
      ]).pipe(

        switchMap(([page, limit, filters]) =>
          this.seguimientosService.getSeguimientos({

            offset: (page - 1) * limit,
            limit,
            ...filters,
          })
        )
      )
        .pipe(tap((resp) => console.log('Seguimientos', resp))),
  });

  selectedSeguiResource = rxResource({
    stream: () =>
      this.selectedSeguiId$.pipe(
        switchMap(id =>
          id
            ? this.seguimientosService.getSegui(id)
            : of(null)
        )
      )
  });

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

  getFieldError(fieldName: string): string | null {

    const control =
      this.seguiForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
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
  openSeguiModal(hojaRuta: any) {

    console.log('Hoja de Ruta seleccionada', hojaRuta);

    this.selectedHrId.set(hojaRuta._id);

    const modal = document.getElementById(
      'segui_modal'
    ) as HTMLDialogElement;

    modal.showModal();
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

  anularEnvio(segui: Seguimiento) {
    console.log('Anular envío de Hoja de Ruta', segui);
    Swal.fire({
      title: '¿Anular envío?',
      text: `Hoja de Ruta Nº ${segui.numeroHr}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then(async result => {

      if (!result.isConfirmed) return;

      try {

        await firstValueFrom(
          this.seguimientosService.anularEnvio(segui._id)
        );

        this.seguimientosResource.reload();

        Swal.fire(
          'Correcto',
          'El envío fue anulado.',
          'success'
        );

      } catch (e: any) {

        Swal.fire(
          'No se puede anular',
          e.error?.message ?? 'La hoja de ruta ya fue recibida.',
          'warning'
        );

      }

    });

  }
  async changeStatus(segui: Seguimiento) {

    const result = await Swal.fire({
      title: '¿Recibir documento?',
      text: `Hoja de Ruta Nº ${segui.numeroHr}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, recibir',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    await firstValueFrom(
      this.seguimientosService.updateSeguimiento(
        segui._id,
        { estado: 'RECIBIDO' }
      )
    );

    this.seguimientosResource.reload();

    Swal.fire(
      'Actualizado',
      'La hoja de ruta fue marcada como RECIBIDO',
      'success'
    );
  }


  // ...existing code...
  seguiForm = this.fb.nonNullable.group({
    origenHr: ['', Validators.required],
    idHojaRuta: ['', Validators.required],
    numeroHr: [0, Validators.required],
    tipoEnvio: ['OFICIAL'],
    detalle: ['', Validators.required],
    fechaDerivado: [new Date()],
    numeroCopia: [0],

    idUnidadOrgOrigen: [''],
    idUnidadFuncOrigen: [''],
    idSubUnidadOrigen: [''],

    idUnidadOrgDest: [''],
    idUnidadFuncDest: [''],
    idSubUnidadDest: [''],



    origenUser: ['', Validators.required],
    destinoUser: ['', Validators.required],

    archivosOficina: [[]],
    carpetasOficina: [[]],
  });

  orgsResource = rxResource({
    stream: () => this.orgService.getOrgs()
      .pipe(tap((resp) => console.log('orgs', resp))),
  });

  onOrgChange(event: Event) {

    const id = (event.target as HTMLSelectElement).value;

    const org = this.orgsResource.value()
      ?.find(o => o._id === id);

    if (!org) return;

    this.selectedOrg.set(org);
    this.selectedUnidad.set(null);
    this.selectedSubUnidad.set(null);

    this.seguiForm.patchValue({
      idUnidadOrgDest: org._id,
      idUnidadFuncDest: '',
      idSubUnidadDest: '',
      destinoUser:
        typeof org.persona === 'string'
          ? org.persona
          : (org.persona?._id ?? '')
    });
  }

  onUnidadChange(event: Event) {

    const id = (event.target as HTMLSelectElement).value;

    const unidad = this.selectedOrg()
      ?.unidadFuncional
      ?.find((u: any) => u._id === id);

    if (!unidad) return;

    this.selectedUnidad.set(unidad);
    this.selectedSubUnidad.set(null);

    this.seguiForm.patchValue({
      idUnidadFuncDest: unidad._id,
      destinoUser: unidad.persona?._id ?? '',
      idUnidadOrgDest: '',
      idSubUnidadDest: '',
    });
  }

  onSubUnidadChange(event: Event) {

    const id = (event.target as HTMLSelectElement).value;

    const subUnidad = this.selectedUnidad()
      ?.subUnidad
      ?.find((s: any) => s._id === id);

    console.log('SubUnidad seleccionada', subUnidad);
    if (!subUnidad) return;

    this.selectedSubUnidad.set(subUnidad);

    this.seguiForm.patchValue({
      destinoUser: subUnidad.persona?._id ?? '',
      idSubUnidadDest: subUnidad._id,
      idUnidadFuncDest: '',
      idUnidadOrgDest: '',
    });

  }

  destinoSeleccionado = computed(() => {

    if (this.selectedSubUnidad()) {
      return this.selectedSubUnidad();
    }

    if (this.selectedUnidad()) {
      return this.selectedUnidad();
    }

    if (this.selectedOrg()) {
      return this.selectedOrg();
    }

    return null;

  });

  private resetDestinoSeleccionado() {

    this.selectedOrg.set(null);
    this.selectedUnidad.set(null);
    this.selectedSubUnidad.set(null);

    this.seguiForm.patchValue({


      idUnidadOrgDest: '',
      idUnidadFuncDest: '',
      idSubUnidadDest: '',
      destinoUser: '',
    });

  }

  async recibirPendiente(segui: Seguimiento) {

    console.log('CLICK RECIBIR:', segui);

    const result = await Swal.fire({
      title: '¿Recibir documento?',
      html: `
      <div class="text-left">
        <p class="mb-2">
          ¿Desea registrar la recepción de:
        </p>

        <p class="font-bold">
          H.R. Nº ${segui.numeroHr}
        </p>

        <p class="text-sm opacity-70 mt-2">
          ${segui.origenHr ?? ''}
        </p>
      </div>
    `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, recibir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,

      // IMPORTANTE
      customClass: {
        container: 'swal-container'
      }
    });

    console.log('RESULTADO SWAL:', result);

    if (!result.isConfirmed) {
      return;
    }

    try {

      console.log(
        'Actualizando seguimiento:',
        segui._id
      );

      await firstValueFrom(
        this.seguimientosService.updateSeguimiento(
          segui._id,
          {
            estado: 'RECIBIDO'
          }
        )
      );

      console.log(
        'Seguimiento actualizado correctamente'
      );

      await Swal.fire({
        title: 'Documento recibido',
        text: `H.R. Nº ${segui.numeroHr} fue recibida correctamente.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      this.seguimientosResource.reload();

    } catch (error: any) {

      console.error(
        'Error al recibir seguimiento:',
        error
      );

      await Swal.fire({
        title: 'Error',
        text:
          error?.error?.message ??
          error?.message ??
          'No se pudo registrar la recepción.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });

    }
  }


  openNewModalSeg(segui: Seguimiento, copia: boolean) {
    this.resetDestinoSeleccionado();

    const user = this.user()
    this.seguimientos.set(segui);

    // Obtener el id de la Hoja de Ruta
    const idHojaRuta =
      typeof segui.idHojaRuta === 'string'
        ? segui.idHojaRuta
        : segui.idHojaRuta._id;

    this.isPosting.set(true);

    this.hojaRutaService.getHojaRuta(idHojaRuta).subscribe({
      next: (hojaRuta) => {

        let tipoEnvio = segui.tipoEnvio;
        let numeroCopia = segui.numeroCopia ?? 0;

        const maxNumeroCopia =
          hojaRuta.seguimientos?.reduce(
            (max, seg) => Math.max(max, seg.numeroCopia ?? 0),
            0
          ) ?? 0;

        const siguienteNumeroCopia = maxNumeroCopia + 1;


        if (copia === true) {
          tipoEnvio = 'COPIA';
          numeroCopia = siguienteNumeroCopia;
        }

        this.seguiForm.reset({
          origenHr: segui.origenHr,
          idHojaRuta: typeof segui.idHojaRuta === 'string' ? segui.idHojaRuta : segui.idHojaRuta._id,
          numeroHr: segui.numeroHr,
          tipoEnvio: tipoEnvio,
          detalle: '',
          fechaDerivado: new Date(),
          numeroCopia: numeroCopia,
          idUnidadOrgOrigen: user?.idUnidadOrg ? (typeof user.idUnidadOrg === 'string' ? user.idUnidadOrg : user.idUnidadOrg._id) : '',
          idUnidadFuncOrigen: user?.idUnidadFuncional ? (typeof user.idUnidadFuncional === 'string' ? user.idUnidadFuncional : user.idUnidadFuncional._id) : '',
          idSubUnidadOrigen: user?.idSubUnidad ? (typeof user.idSubUnidad === 'string' ? user.idSubUnidad : user.idSubUnidad._id) : '',
          idUnidadFuncDest: '',
          idUnidadOrgDest: '',
          idSubUnidadDest: '',
          origenUser: user?._id,
          destinoUser: '',
        });

        this.isPosting.set(false);

        const modal = document.getElementById(
          'newSeg_modal'
        ) as HTMLDialogElement | null;

        modal?.showModal();
      },

      error: (err) => {
        this.isPosting.set(false);
        console.error(err);
      },
    });
  }

  onSubmitSeg() {

    if (this.seguiForm.invalid) {
      this.seguiForm.markAllAsTouched();
      return;
    }

    this.isPosting.set(true);

    const seguimientoData = this.seguiForm.getRawValue() as any;
    const modal = document.getElementById(
      'newSeg_modal'
    ) as HTMLDialogElement;

    this.seguimientosService
      .createSeguimiento(seguimientoData)
      .subscribe({

        next: (resp) => {

          // Actualizar estado de la Hoja de Ruta
          const seguimiento = this.seguimientos();
          if (!seguimiento) return;

          this.seguimientosService
            .updateSeguimiento(seguimiento._id, {
              estado: 'DERIVADO'
            })
            .subscribe({

              next: () => {

                this.resetDestinoSeleccionado();

                this.seguiForm.reset({
                  origenHr: '',
                  idHojaRuta: '',
                  numeroHr: 0,
                  tipoEnvio: 'OFICIAL',
                  detalle: '',
                  fechaDerivado: new Date(),
                  numeroCopia: 0,
                  idUnidadFuncOrigen: '',
                  idUnidadOrgOrigen: '',
                  idSubUnidadOrigen: '',
                  idUnidadFuncDest: '',
                  idUnidadOrgDest: '',
                  idSubUnidadDest: '',
                  origenUser: '',
                  destinoUser: '',
                });

                this.hojaRutaService.clearCache();
                this.seguimientosResource.reload();

                this.isPosting.set(false);


                Swal.fire(
                  'Correcto',
                  'El seguimiento fue creado exitosamente.',
                  'success'
                );

              },

              error: (err) => {

                console.error('Error al actualizar la Hoja de Ruta', err);

                this.isPosting.set(false);

                Swal.fire(
                  'Advertencia',
                  'El seguimiento fue creado, pero no se pudo actualizar el estado de la Hoja de Ruta.',
                  'warning'
                );

              }

            });

        },

        error: (err) => {

          console.error('Error al crear seguimiento', err);

          this.isPosting.set(false);

          Swal.fire(
            'Error',
            err.error?.message ?? 'No se pudo registrar el seguimiento.',
            'error'
          );

        }

      });
    modal.close();

  }

  toggleSeleccion(segui: Seguimiento) {

    const lista = this.selectedSeguimientos();

    const existe = lista.some(
      x => x._id === segui._id
    );


    if (existe) {

      this.selectedSeguimientos.set(
        lista.filter(
          x => x._id !== segui._id
        )
      );

    } else {

      this.selectedSeguimientos.set([
        ...lista,
        segui
      ]);

    }
  }
  isSelected(segui: Seguimiento) {

    return this.selectedSeguimientos()
      .some(x => x._id === segui._id);

  }

  openModalAsociar() {

    this.seguimientoOficial.set(null);

    const modal = document.getElementById(
      'modal_asociar'
    ) as HTMLDialogElement;

    modal.showModal();

  }

  asociarSeleccionados() {
    const oficial = this.seguimientoOficial();
    if (!oficial) {
      return;
    }
    const ids = this.selectedSeguimientos()
      .filter(
        x => x._id !== oficial._id
      )
      .map(
        x => x._id
      );

    this.seguimientosService
      .asociarHojaRuta(
        oficial._id,
        ids
      )
      .subscribe({

        next: (resp) => {
          console.log('Asociado', resp);
          this.selectedSeguimientos.set([]);
          const modal =
            document.getElementById(
              'modal_asociar'
            ) as HTMLDialogElement;
          modal.close();
          this.seguimientosResource.reload();
        },
        error: (err) => {
          console.error(err);
        }

      });
  }

}
