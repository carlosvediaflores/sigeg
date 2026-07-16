import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HojaRutaService } from '../../services/hojaRuta.service';
import { HojaRutaResponse, Seguimiento, HojaRutaSimple } from '../../interfaces/hojaRuta';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, firstValueFrom, map, of, startWith, switchMap, tap } from 'rxjs';
import { Pagination } from '@shared/components/pagination/pagination';
import { DatePipe, JsonPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Org } from '../../../organizacion/interfaces/org.interface';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { UserService } from '../../../../users/services/user.service';
import Swal from 'sweetalert2';
import { EntidadService } from '../../../entidades/services/entidad.service';
import { SeguimientosService } from '../../services/seguimientos.service';

@Component({
  selector: 'app-hoja-ruta',
  imports: [RouterLink, Pagination, DatePipe, FormErrorLabel, ReactiveFormsModule,],
  templateUrl: './hoja-ruta.html',
  styleUrl: './hoja-ruta.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HojaRuta {

  constructor() {

    // Cambio entre INTERNO y EXTERNO
    this.hRutaForm.get('tipoOrigen')?.valueChanges.subscribe(tipo => {

      const origenControl = this.hRutaForm.get('origen');

      if (tipo === 'INTERNO') {

        origenControl?.clearValidators();

        this.hRutaForm.patchValue({
          origen: '',
          idOrigen: '',
          entidad: ''

        });

      } else if (tipo === 'EXTERNO') {
        origenControl?.clearValidators();

        this.hRutaForm.patchValue({
          origen: '',
          idOrigen: '',
          entidad: ''
        });
      }
      else {

        origenControl?.setValidators([Validators.required]);

        this.hRutaForm.patchValue({
          idOrigen: ''
        });

      }

      origenControl?.updateValueAndValidity();

    });


    // Cuando selecciona un funcionario
    this.hRutaForm.get('idOrigen')?.valueChanges.subscribe(id => {

      if (!id) return;

      if (this.hRutaForm.get('tipoOrigen')?.value !== 'INTERNO') {
        return;
      }

      const usuario = this.usersResource
        .value()
        ?.users
        ?.find(user => user._id === id);

      if (!usuario) return;

      this.hRutaForm.patchValue({
        origen: `${usuario.nombre} ${usuario.apellidos}`
      });

    });

    // Cuando selecciona un entidad
    this.hRutaForm.get('entidad')?.valueChanges.subscribe(id => {

      if (!id) return;

      if (this.hRutaForm.get('tipoOrigen')?.value !== 'EXTERNO') {
        return;
      }

      const entidad = this.entidadResource
        .value()
        ?.entidades
        ?.find(entidad => entidad._id === id);

      if (!entidad) return;

      this.hRutaForm.patchValue({
        origen: `${entidad.denominacion} - ${entidad.codigo}`,
        representante: entidad.representante ? `${entidad.representante.nombre} ${entidad.representante.apellidos}` : ''
      });

    });

    // Cuando selecciona un OTRO
    this.hRutaForm.get('origen')?.valueChanges.subscribe(id => {

      if (!id) return;

      if (this.hRutaForm.get('tipoOrigen')?.value !== 'OTRO') {
        return;
      }

      this.hRutaForm.patchValue({
        representante: this.hRutaForm.get('origen')?.value || ''
      });

    });

  }

  hojaRutaService = inject(HojaRutaService);
  seguimientosService = inject(SeguimientosService);
  userService = inject(UserService);
  entidadService = inject(EntidadService);
  public hojaRutas = signal<HojaRutaResponse[] | null>(null);
  selectedHojaRuta = signal<HojaRutaSimple | null>(null);
  selectedHrId = signal('');
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  selectedHRId = signal<string>('new');
  successMessage = signal('');
  wasSaved = signal(false);
  isPosting = signal(false);
  selectedHrId$ = toObservable(this.selectedHrId);

  year = new Date().getFullYear();
  numeroHR = 0;

  searchFormHR = this.fb.group({
    gestion: [this.year],
    termino: [''],
    estado: [''],
    numero: [''],
  });

  searchFormHR$ = this.searchFormHR.valueChanges.pipe(
    startWith(this.searchFormHR.value),
    debounceTime(300),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
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

  hojaRutaPerPage = signal(10);
  currentPage$ = toObservable(this.currentPage);

  hojaRutaPerPage$ =
    toObservable(this.hojaRutaPerPage);

  hojaRutaResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.hojaRutaPerPage$,
        this.searchFormHR$,
      ]).pipe(

        switchMap(([page, limit, filters]) =>
          this.hojaRutaService.getHojaRutas({

            offset: (page - 1) * limit,
            limit,
            ...filters,
          })
        )
      )
        .pipe(tap((resp) => console.log('hojasRuta', resp))),
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

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  searchForm = this.fb.group({
    estado: ['true'],
  });

  entidadResource = rxResource({
    stream: () =>
      combineLatest([
        this.searchForm.valueChanges.pipe(startWith(this.searchForm.value)),
      ]).pipe(
        switchMap(([formValue]) =>
          this.entidadService.getEntidad(formValue)
        )
      ),
  });

  hRutaForm = this.fb.nonNullable.group({
    origen: ['', Validators.required],
    idOrigen: [''],
    tipoOrigen: ['INTERNO',],
    tipoDocumento: ['NORMAL', Validators.required],
    prioridad: ['NORMAL'],
    beneficiarioPago: [''],
    contactoOrigen: [''],
    referencia: ['', Validators.required],
    estado: ['REGISTRADO'],
    numero: [this.numeroHR, Validators.required],
    fechaDocumento: [this.getToday()],
    fechaRecepcion: [new Date()],
    seguimientos: [[] as Seguimiento[]],
    entidad: [''],
    representante: [''],
    cite: [''],
  });


  openNewModal() {
    this.selectedHRId.set('new');
    this.hRutaForm.reset({
      origen: '',
      idOrigen: '',
      tipoOrigen: 'INTERNO',
      tipoDocumento: 'NORMAL',
      prioridad: 'NORMAL',
      beneficiarioPago: '',
      contactoOrigen: '',
      referencia: '',
      estado: 'REGISTRADO',
      numero: this.numeroHR + 1,
      fechaDocumento: this.getToday(),
      fechaRecepcion: new Date(),
      seguimientos: [],
      entidad: '',
      representante: '',
      cite: '',

    });

    const modal = document.getElementById(
      'hRuta_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  getTiempoPendiente(fecha: string | Date): string {

    const inicio = new Date(fecha).getTime();
    const ahora = Date.now();

    const diff = ahora - inicio;

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${dias}d ${horas}h ${minutos}m`;
  }

  async onSubmit() {

    if (this.hRutaForm.invalid) {

      this.hRutaForm.markAllAsTouched();
      return;

    }

    this.isPosting.set(true);

    try {

      const hRutaLike = this.hRutaForm.getRawValue();

      if (this.selectedHRId() === 'new') {

        await firstValueFrom(
          this.hojaRutaService.createHojaRuta(hRutaLike)
        );

      } else {

        await firstValueFrom(
          this.hojaRutaService.updateHojaRuta(
            this.selectedHRId(),
            hRutaLike
          )
        );
      }
      this.hojaRutaResource.reload();

      this.hRutaForm.reset({
        origen: '',
        idOrigen: '',
        tipoOrigen: 'INTERNO',
        tipoDocumento: 'NORMAL',
        prioridad: 'NORMAL',
        beneficiarioPago: '',
        contactoOrigen: '',
        referencia: '',
        estado: 'REGISTRADO',
        numero: 0,
        fechaDocumento: this.getToday(),
        fechaRecepcion: new Date(),
        seguimientos: [],
        entidad: '',
        representante: '',
        cite: '',
      });


      const modal = document.getElementById(
        'hRuta_modal'
      ) as HTMLDialogElement;

      if (this.selectedHRId() === 'new') {
        this.successMessage.set('Hoja de Ruta creada correctamente');
      } else {
        this.successMessage.set('Hoja de Ruta actualizada correctamente');
      }

      this.wasSaved.set(true);

      // modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);
    } finally {

      this.isPosting.set(false);
    }

  }

  async changeStatus(hr: HojaRutaSimple) {

    const result = await Swal.fire({
      title: '¿Recibir documento?',
      text: `Hoja de Ruta Nº ${hr.numero}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, recibir',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    await firstValueFrom(
      this.hojaRutaService.updateHojaRuta(
        hr._id,
        { estado: 'RECIBIDO' }
      )
    );

    this.hojaRutaResource.reload();

    Swal.fire(
      'Actualizado',
      'La hoja de ruta fue marcada como RECIBIDO',
      'success'
    );
  }

  anularEnvio(hr: HojaRutaSimple) {
     //console.log('Anular envío de Hoja de Ruta', hr);
    Swal.fire({
      title: '¿Anular envío?',
      text: `Hoja de Ruta Nº ${hr.numero}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then(async result => {

      if (!result.isConfirmed) return;

      try {

        await firstValueFrom(
          this.hojaRutaService.anularEnvio(hr._id)
        );

        this.hojaRutaResource.reload();

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

  openSeguiModal(hojaRuta: HojaRutaSimple) {

    console.log('Hoja de Ruta seleccionada', hojaRuta);

    this.selectedHrId.set(hojaRuta._id);

    const modal = document.getElementById(
      'segui_modal'
    ) as HTMLDialogElement;

    modal.showModal();
  }

  getFieldError(fieldName: string): string | null {

    const control =
      this.hRutaForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }

  printHojaRuta(hr: HojaRutaSimple) {

    this.hojaRutaService.printHojaRuta(hr._id)
      .subscribe(blob => {

        const url = window.URL.createObjectURL(blob);

        window.open(url, '_blank');

        // Liberar memoria después de unos segundos
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

      });

  }
}
