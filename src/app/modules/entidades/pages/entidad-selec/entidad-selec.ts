import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { startWith, debounceTime, distinctUntilChanged, map, combineLatest, switchMap, firstValueFrom } from 'rxjs';
import { EntidadService } from '../../services/entidad.service';
import { JsonPipe } from '@angular/common';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { Pagination } from '@shared/components/pagination/pagination';
import { Entidad } from '../../interfaces/entidad.interface';
import { RepresentanteService } from '../../services/representante.service';

@Component({
  selector: 'app-entidad-selec',
  imports: [Pagination, ReactiveFormsModule, FormErrorLabel, JsonPipe,],
  templateUrl: './entidad-selec.html',
  styleUrl: './entidad-selec.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntidadSelec {
  private entidadService = inject(EntidadService);
  private representanteService = inject(RepresentanteService);
  route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  wasSaved = signal(false);
  isPosting = signal(false);

  searchForm = this.fb.group({
    tipoEntidad: [''],
    termino: [''],
    estado: ['true'],
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

  repesentanteForm = this.fb.nonNullable.group({
    email: ['',],
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    ci: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    cargo: ['', Validators.required],
    isActive: [true,],
    idEntidad: [''],
  })
  openAddRepresModal(entidad: Entidad) {
    this.repesentanteForm.reset({
      email: '',
      nombre: '',
      apellidos: '',
      ci: '',
      direccion: '',
      telefono: '',
      cargo: '',
      isActive: true,
      idEntidad: entidad._id,
    });

    const modal = document.getElementById(
      'representante_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmit() {
    if (this.repesentanteForm.invalid) {

      this.repesentanteForm.markAllAsTouched();
      return;

    }

    this.isPosting.set(true);

    try {

      const { idEntidad, ...representanteData } =
        this.repesentanteForm.getRawValue();


      await firstValueFrom(
        this.representanteService.createRepresentante({
          ...representanteData,
          idEntidad: { _id: idEntidad } as any,
        })
      );

      this.entidadResource.reload();

      this.repesentanteForm.reset({
        email: '',
        nombre: '',
        apellidos: '',
        ci: '',
        direccion: '',
        telefono: '',
        cargo: '',
        isActive: true,
        idEntidad: '',
      });
      const modal = document.getElementById(
        'representante_modal'
      ) as HTMLDialogElement;

      this.successMessage.set('Representante agregado correctamente');


      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);

    } finally {

      this.isPosting.set(false);

    }

  }

  getFieldError(fieldName: string): string | null {

    const control =
      this.repesentanteForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }

}
