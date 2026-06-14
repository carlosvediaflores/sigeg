import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Role } from '../../interfaces/roles.interface';
import { RolesService } from '../../services/roles.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-roles-list',
  imports: [RouterLink, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesList {
  rolesService = inject(RolesService);
  public roles = signal<Role[] | null>(null);

  rolesResource = rxResource({
    stream: () => this.rolesService.getRoles(),
  });

  fb = inject(FormBuilder);

  selectedRoleId = signal<string>('new');
  successMessage = signal('');

  isPosting = signal(false);
  wasSaved = signal(false);

  roleForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    permissions: [[] as Role['permissions']],
  });

  openNewModal() {

    this.selectedRoleId.set('new');

    this.roleForm.reset({
      name: '',
      description: '',
      permissions: [] as Role['permissions'],
    });

    const modal = document.getElementById(
      'role_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  openEditModal(role: Role) {

    this.selectedRoleId.set(role._id);

    this.roleForm.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });

    const modal = document.getElementById(
      'role_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmit() {

    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();
      return;

    }

    this.isPosting.set(true);

    try {

      const permisoLike =
        this.roleForm.getRawValue();

      if (this.selectedRoleId() === 'new') {

        await firstValueFrom(
          this.rolesService.createRole(permisoLike)
        );

      } else {

        await firstValueFrom(
          this.rolesService.updateRole(
            this.selectedRoleId(),
            permisoLike
          )
        );
      }
      this.rolesResource.reload();

      this.roleForm.reset({
        name: '',
        description: '',
        permissions: [] as Role['permissions'],
      });


      const modal = document.getElementById(
        'role_modal'
      ) as HTMLDialogElement;

      if (this.selectedRoleId() === 'new') {
        this.successMessage.set('Rol creado correctamente');
      } else {
        this.successMessage.set('Rol actualizado correctamente');
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
      this.roleForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }

}

