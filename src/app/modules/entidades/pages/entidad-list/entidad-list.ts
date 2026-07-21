import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntidadService } from '../../services/entidad.service';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { map, combineLatest, switchMap, firstValueFrom, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { Pagination } from '@shared/components/pagination/pagination';
import { Entidad } from '../../interfaces/entidad.interface';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-entidad-list',
  imports: [Pagination, ReactiveFormsModule, FormErrorLabel,],
  templateUrl: './entidad-list.html',
  styleUrl: './entidad-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntidadList {
  private activatedRoute = inject(ActivatedRoute);
  private entidadService = inject(EntidadService);
  private router = inject(Router);
  route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  wasSaved = signal(false);
  wasError = signal(false);
  errorMessage = signal('');
  isPosting = signal(false);
  selectedEntidadId = signal<string>('new');

  entidadForm = this.fb.nonNullable.group({
    nit: [null as number | null],
    cuenta: [null as number | null],
    denominacion: ['', Validators.required],
    codigo: ['', Validators.required],
    sigla: ['', Validators.required],
    telefono: ['',],
    estado: [true,],
    tipoEntidad: ['', Validators.required],
  });

  searchForm = this.fb.group({
    tipoEntidad: [''],
    termino: [''],
    estado: [''],
  });

  searchForm$ = this.searchForm.valueChanges.pipe(
    startWith(this.searchForm.value),
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
  entidadPerPage = signal(20);
  currentPage$ = toObservable(this.currentPage);
  successMessage = signal('');
  entidadPerPage$ =
  toObservable(this.entidadPerPage);


  entidadResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.entidadPerPage$,
        this.searchForm$,
      ]).pipe(
        switchMap(([page, limit, filters]) =>
          this.entidadService.getEntidad({
            offset: (page - 1) * limit,
            limit,
            ...filters,
          })
        )
      ),
  });

  // entidadResource = rxResource({
  //   stream: () =>
  //     combineLatest([
  //       this.currentPage$,
  //       this.entidadPerPage$,
  //     ]).pipe(

  //       switchMap(([page, limit]) =>
  //         this.entidadService.getEntidad({
  //           offset: (page - 1) * limit,
  //           limit,
  //         })
  //       )
  //     ),
  // });

  openNewModal() {

    this.selectedEntidadId.set('new');

    this.entidadForm.reset({
      nit: null,
      cuenta: null,
      denominacion: '',
      codigo: '',
      sigla: '',
      telefono: '',
      estado: true,
      tipoEntidad: '',
    });

    const modal = document.getElementById(
      'entidad_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  openEditModal(entidad: Entidad) {

    this.selectedEntidadId.set(entidad._id);

    this.entidadForm.reset({
      nit: entidad.nit,
      cuenta: entidad.cuenta,
      denominacion: entidad.denominacion,
      codigo: entidad.codigo,
      sigla: entidad.sigla,
      telefono: entidad.telefono,
      estado: entidad.estado,
      tipoEntidad: entidad.tipoEntidad,
    });

    const modal = document.getElementById(
      'entidad_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmit() {

    if (this.entidadForm.invalid) {

      this.entidadForm.markAllAsTouched();
      return;

    }

    this.isPosting.set(true);

    try {

      const entidadLike =
        this.entidadForm.getRawValue();

      if (this.selectedEntidadId() === 'new') {

        await firstValueFrom(
          this.entidadService.createEntidad(entidadLike)
        );

      } else {

        await firstValueFrom(
          this.entidadService.updateEntidad(
            this.selectedEntidadId(),
            entidadLike
          )
        );
      }
      this.entidadResource.reload();

      this.entidadForm.reset({
        nit: null,
        cuenta: null,
        denominacion: '',
        codigo: '',
        sigla: '',
        telefono: '',
        estado: true,
        tipoEntidad: '',
      });


      const modal = document.getElementById(
        'entidad_modal'
      ) as HTMLDialogElement;

      this.successMessage.set(
        this.selectedEntidadId() === 'new'
          ? 'Entidad creada correctamente'
          : 'Entidad actualizada correctamente'
      );

      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);

    }catch (error) {

      const err = error as HttpErrorResponse;

      this.errorMessage.set(
        err.error?.message ??
        err.message ??
        'Ocurrió un error inesperado.'
      );

      this.wasError.set(true);

      setTimeout(() => {
        this.wasError.set(false);
      }, 5000);

    } finally {

      this.isPosting.set(false);

    }

  }

  getFieldError(fieldName: string): string | null {

    const control =
      this.entidadForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }
}
