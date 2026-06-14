import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HojaRutaService } from '../../services/hojaRuta.service';
import { HojaRutaResponse, Seguimientos } from '../../interfaces/hojaRuta';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { Pagination } from '@shared/components/pagination/pagination';
import { DatePipe, JsonPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Org } from '../../../organizacion/interfaces/org.interface';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { UserService } from '../../../../users/services/user.service';

@Component({
  selector: 'app-hoja-ruta',
  imports: [RouterLink, Pagination, DatePipe, FormErrorLabel, ReactiveFormsModule, JsonPipe],
  templateUrl: './hoja-ruta.html',
  styleUrl: './hoja-ruta.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HojaRuta {

  hojaRutaService = inject(HojaRutaService);
  userService = inject(UserService);
  public hojaRutas = signal<HojaRutaResponse[] | null>(null);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  selectedHRId = signal<string>('new');
  successMessage = signal('');
  wasSaved = signal(false);
  isPosting = signal(false);
  numeroHR = 3

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


  hRutaForm = this.fb.nonNullable.group({
    origen: ['', Validators.required],
    idOrigen: [''],
    tipoOrigen: ['INTERNO',],
    tipoDocumento: ['NORMAL', Validators.required],
    prioridad: ['NORMAL'],
    beneficiarioPago: [''],
    contactoOrigen: [''],
    referencia: ['',Validators.required],
    estado: ['REGISTRADO'],
    numero: [this.numeroHR, Validators.required],
    gestion: [0],
    fechaDocumento: [new Date()],
    fechaRecepcion: [new Date()],
    seguimientos: [[] as Seguimientos[]],
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
      numero: this.numeroHR +1,
      gestion: 0,
      fechaDocumento: new Date(),
      fechaRecepcion: new Date(),
      seguimientos: [],
    });

    const modal = document.getElementById(
      'hRuta_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
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
        fechaDocumento: new Date(),
        fechaRecepcion: new Date(),
        seguimientos: [],
      });


      const modal = document.getElementById(
        'org_modal'
      ) as HTMLDialogElement;

      if (this.selectedHRId() === 'new') {
        this.successMessage.set('Hoja de Ruta creada correctamente');
      } else {
        this.successMessage.set('Hoja de Ruta actualizada correctamente');
      }

      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);
    } finally {

      this.isPosting.set(false);
    }

  }
   async changeStatus(){
    
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
}
