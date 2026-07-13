import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { UserService } from '../../../../users/services/user.service';
import { HojaRutaService } from '../../services/hojaRuta.service';
import { SeguimientosService } from '../../services/seguimientos.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';
import { JsonPipe } from '@angular/common';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { OrgService } from '../../../organizacion/services/org.service';

@Component({
  selector: 'app-new-seguimiento',
  imports: [ReactiveFormsModule, FormErrorLabel, RouterLink, JsonPipe],
  templateUrl: './new-seguimiento.html',
  styleUrl: './new-seguimiento.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewSeguimiento {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  hrId = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['id']),
      tap((resp) => console.log('idHojaRuta', resp))
    ),
    {
      initialValue: '',
    }
  );

  seguiId = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['idSeg']),
      tap((resp) => console.log('idSeg', resp))
    ),
    {
      initialValue: '',
    }
  );
  hrId$ = toObservable(this.hrId);
  seguiId$ = toObservable(this.seguiId);

  hojaRutaService = inject(HojaRutaService);
  userService = inject(UserService);
  seguimientosService = inject(SeguimientosService);
  private orgService = inject(OrgService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  successMessage = signal('');
  wasSaved = signal(false);
  isPosting = signal(false);
  selectedOrg = signal<any | null>(null);
  selectedUnidad = signal<any | null>(null);
  selectedSubUnidad = signal<any | null>(null);

  user = computed(() => this.authService.user());
  usersResource = rxResource({
    stream: () => this.userService.getUsers({ limit: 1000 })
      .pipe(tap((resp) => console.log('Users', resp))),
  });

  hojaRutaResource = rxResource({
    stream: () => this.hojaRutaService.getHojaRuta(this.hrId())
      .pipe(tap((resp) => console.log('HojaRuta', resp))),
  });

  constructor() {

    effect(() => {

      const hr = this.hojaRutaResource.value();
      console.log('HojaRuta seleccionada', hr);

      if (!hr) return;

      this.seguiForm.patchValue({
        origenHr: hr.origen,
        idHojaRuta: hr._id,
        numeroHr: hr.numero,

      });
      const user = this.user();

      if (!user) return;

      console.log('User', user);
      this.seguiForm.patchValue({
        origenUser: user._id,
        idUnidadOrgOrigen: user.idUnidadOrg ? (typeof user.idUnidadOrg === 'string' ? user.idUnidadOrg : user.idUnidadOrg._id) : '',
        idUnidadFuncOrigen: user.idUnidadFuncional ? (typeof user.idUnidadFuncional === 'string' ? user.idUnidadFuncional : user.idUnidadFuncional._id) : '',
        idSubUnidadOrigen: user.idSubUnidad ? (typeof user.idSubUnidad === 'string' ? user.idSubUnidad : user.idSubUnidad._id) : '',
      });


    });

  }

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
    idUnidadFuncDest: [''],
    idUnidadOrgDest: [''],
    idSubUnidadDest: [''],
    origenUser: ['', Validators.required],
    destinoUser: ['', Validators.required],
    archivosOficina: [[]],
    carpetasOficina: [[]],
  });


  // ...existing code...

  onSubmit() {

    if (this.seguiForm.invalid) {
      this.seguiForm.markAllAsTouched();
      return;
    }

    const seguimientoData = this.seguiForm.getRawValue() as any;

    this.isPosting.set(true);

    this.seguimientosService
      .createSeguimiento(seguimientoData)
      .subscribe({
        next: (resp) => {

          console.log('Seguimiento creado', this.seguiId(),);

          this.wasSaved.set(true);
          this.successMessage.set('Seguimiento creado exitosamente.');

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
          this.seguimientosService
            .updateSeguimiento(this.seguiId(), { estado: 'DERIVADO' })
            .subscribe();
          this.router.navigate(['/hojaRuta/list']);
          this.hojaRutaService.clearCache();
          this.isPosting.set(false);
        },
        error: (err) => {

          console.error('Error al crear seguimiento', err);

          this.isPosting.set(false);

        }
      });
  }

  orgsResource = rxResource({
    stream: () => this.orgService.getOrgs()
      .pipe(tap((resp) => console.log('orgs', resp))),
  });

  getFieldError(fieldName: string): string | null {

    const control =
      this.seguiForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }
}
