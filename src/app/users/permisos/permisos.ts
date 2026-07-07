import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap, firstValueFrom } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PermisosService } from '../services/permisos.service';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { FormUtils } from '../../utils copy/form-utils';

@Component({
  selector: 'app-permisos',
  imports: [ReactiveFormsModule, FormErrorLabel, RouterLink],
  templateUrl: './permisos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Permisos {

  private activatedRoute = inject(ActivatedRoute);
  private permisosService = inject(PermisosService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  wasSaved = signal(false);
  isPosting = signal(false);

  permisoId = toSignal(
    this.activatedRoute.params.pipe(
      map(params => params['id'])
    ),
    {
      initialValue: 'new'
    }
  );


  permisoId$ = toObservable(this.permisoId);

  permisoForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    method: ['', Validators.required],
    urn: ['', Validators.required],
  });

  getFieldError(fieldName: string): string | null {

    const control = this.permisoForm.get(fieldName);

    if (!control) return null;

    if (!control.touched) return null;

    const errors = control.errors ?? {};

    return Object.keys(errors).length > 0
      ? FormUtils.getTextError(errors)
      : null;
  }

  permisoResource = rxResource({
    stream: () =>
      this.permisoId$.pipe(
        distinctUntilChanged(),
        switchMap(id =>
          this.permisosService.getPermisoById(id)
        )
      ),
  });

  constructor() {

    effect(() => {

      const permiso = this.permisoResource.value();

      if (!permiso) return;

      this.permisoForm.reset({
        name: permiso.name ?? '',
        description: permiso.description ?? '',
        method: permiso.method ?? '',
        urn: permiso.urn ?? '',
      });

    });

  }


  isNewPermiso(): boolean {
    return this.permisoId() === 'new';
  }

  async onSubmit() {

    if (this.isPosting()) return;

    this.isPosting.set(true);

    try {

      // guardar

    } finally {

      this.isPosting.set(false);

    }

    if (this.permisoForm.invalid) {
      this.permisoForm.markAllAsTouched();
      return;
    }

    this.isPosting.set(true);

    try {

      const permisoLike = {
        ...this.permisoForm.getRawValue(),
      };

      if (this.isNewPermiso()) {

        const permiso = await firstValueFrom(
          this.permisosService.createPermiso(permisoLike)
        );

        this.router.navigate([
          '/users/permisos',
          permiso._id
        ]);

      } else {

        await firstValueFrom(
          this.permisosService.updatePermiso(
            this.permisoId(),
            permisoLike
          )
        );

      }

      this.wasSaved.set(true);

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);

    } finally {

      this.isPosting.set(false);

    }

  }

}