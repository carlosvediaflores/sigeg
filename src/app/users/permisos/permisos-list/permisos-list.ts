import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PermisosService } from '../../services/permisos.service';
import { Permiso, PermisosResponse } from '../../interfaces/permisos.interface';
import { Pagination } from '@shared/components/pagination/pagination';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, firstValueFrom, map, switchMap } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';



@Component({
  selector: 'app-permisos-list',
  imports: [Pagination, RouterLink, ReactiveFormsModule, FormErrorLabel, ],
  templateUrl: './permisos-list.html',
  styleUrl: './permisos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermisosList {
  permisosService = inject(PermisosService);
  route = inject(ActivatedRoute);
  public permisos = signal<PermisosResponse[] | null>(null);



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
  permisosPerPage = signal(20);
  currentPage$ = toObservable(this.currentPage);
  successMessage = signal('');
  permisosPerPage$ =
    toObservable(this.permisosPerPage);

  permisosResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.permisosPerPage$,
      ]).pipe(

        switchMap(([page, limit]) =>
          this.permisosService.getPermisos({

            offset: (page - 1) * limit,
            limit,
          })
        )
      ),
  });

  fb = inject(FormBuilder);

  selectedPermisoId = signal<string>('new');

  isPosting = signal(false);
  wasSaved = signal(false);

  permisoForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    method: ['', Validators.required],
    urn: ['', Validators.required],
  });


  openNewModal() {

    this.selectedPermisoId.set('new');

    this.permisoForm.reset({
      name: '',
      description: '',
      method: '',
      urn: '',
    });

    const modal = document.getElementById(
      'permiso_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  openEditModal(permiso: Permiso) {

    this.selectedPermisoId.set(permiso._id);

    this.permisoForm.reset({
      name: permiso.name,
      description: permiso.description,
      method: permiso.method,
      urn: permiso.urn,
    });

    const modal = document.getElementById(
      'permiso_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmit() {

    if (this.permisoForm.invalid) {

      this.permisoForm.markAllAsTouched();
      return;

    }

    this.isPosting.set(true);

    try {

      const permisoLike =
        this.permisoForm.getRawValue();

      if (this.selectedPermisoId() === 'new') {

        await firstValueFrom(
          this.permisosService.createPermiso(permisoLike)
        );

      } else {

        await firstValueFrom(
          this.permisosService.updatePermiso(
            this.selectedPermisoId(),
            permisoLike
          )
        );
      }
      this.permisosResource.reload();

      this.permisoForm.reset({
        name: '',
        description: '',
        method: '',
        urn: '',
      });


      const modal = document.getElementById(
        'permiso_modal'
      ) as HTMLDialogElement;

      if (this.selectedPermisoId() === 'new') {
        this.successMessage.set('Permiso creado correctamente');
      } else {
        this.successMessage.set('Permiso actualizado correctamente');
      }

      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);
      /* this.wasSaved.set(true);
      modal.close();
      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000); */

    } finally {

      this.isPosting.set(false);

    }

  }


  getFieldError(fieldName: string): string | null {

    const control =
      this.permisoForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }


}
