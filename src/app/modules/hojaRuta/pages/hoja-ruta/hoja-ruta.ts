import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HojaRutaService } from '../../services/hojaRuta.service';
import { HojaRutaResponse, Seguimiento, HojaRutaSimple } from '../../interfaces/hojaRuta';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { Pagination } from '@shared/components/pagination/pagination';
import { DatePipe, JsonPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Org } from '../../../organizacion/interfaces/org.interface';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { UserService } from '../../../../users/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hoja-ruta',
  imports: [RouterLink, Pagination, DatePipe, FormErrorLabel, ReactiveFormsModule],
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
          idOrigen: ''
        });

      } else {

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

  }

  hojaRutaService = inject(HojaRutaService);
  userService = inject(UserService);
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

  numeroHR = 0;

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
      ]).pipe(

        switchMap(([page, limit]) =>
          this.hojaRutaService.getHojaRutas({

            offset: (page - 1) * limit,
            limit,
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
    gestion: [0],
    fechaDocumento: [this.getToday()],
    fechaRecepcion: [new Date()],
    seguimientos: [[] as Seguimiento[]],
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
      gestion: 0,
      fechaDocumento: this.getToday(),
      fechaRecepcion: new Date(),
      seguimientos: [],
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
        gestion: 0,
        fechaDocumento: this.getToday(),
        fechaRecepcion: new Date(),
        seguimientos: [],
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
