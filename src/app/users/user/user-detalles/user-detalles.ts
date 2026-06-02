import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { DatePipe, JsonPipe } from '@angular/common';
import { firstValueFrom, tap } from 'rxjs';
import { Role } from '../../interfaces/roles.interface';
import { RolesService } from '../../services/roles.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-detalles',
  imports: [ReactiveFormsModule, FormErrorLabel, JsonPipe],
  templateUrl: './user-detalles.html',
  styleUrl: './user-detalles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetalles implements OnInit {
  user = input.required<User>();
  roles = input<Role[] | null>(null);
  userSignal = signal<User | null>(null);

  router = inject(Router);
  fb = inject(FormBuilder);
  userService = inject(UserService);
  rolesService = inject(RolesService);
  wasSaved = signal(false);
  successMessage = signal('');
  getFieldError(fieldName: string): string | null {

    const control = this.userForm.get(fieldName);

    if (!control) return null;

    if (!control.touched) return null;

    const errors = control.errors ?? {};

    return Object.keys(errors).length > 0
      ? FormUtils.getTextError(errors)
      : null;
  }

  userForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    ci: ['', Validators.required],
    fechaNac: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    password: [''],
    email: ['', [Validators.required, Validators.email]],
    isActive: [false, Validators.required],
    idCargo: [''],
    roles: [[] as User['roles']],
  });

  ngOnInit(): void {


  this.setFormValue(this.user());

  this.userForm.patchValue({
    roles: this.user().roles ?? []
  });

  if (this.isNewUser()) {

    this.userForm.get('password')
      ?.setValidators([
        Validators.required,
        Validators.minLength(6),
      ]);

  } else {

    this.userForm.get('password')
      ?.setValidators([
        Validators.minLength(6),
      ]);

  }

  this.userForm.get('password')
    ?.updateValueAndValidity();


  }

  setFormValue(user: Partial<User>) {

    this.userForm.reset({

      ...user,

      fechaNac: user.fechaNac
        ? new Date(user.fechaNac)
          .toISOString()
          .split('T')[0]
        : '',

    });

  }
  isPosting = signal(false);
  isNewUser() {
    return this.user()._id === 'new';
  }

  rolesResource = rxResource({
    stream: () => this.rolesService.getRoles()
      .pipe(tap((resp) => console.log('roles', resp)))
  });

  hasRole(roleId: string): boolean {

    const roles = this.userForm.get('roles')?.value ?? [];

    return roles.some(role => role._id === roleId);

  }

 async toggleRoles(role: Role) {

  const currentRoles =
    this.userForm.get('roles')?.value ?? [];

  const exists = currentRoles.some(
    r => r._id === role._id
  );

  const updatedRoles = exists
    ? currentRoles.filter(
        r => r._id !== role._id
      )
    : [
        ...currentRoles,
        role
      ];

  // actualizar formulario
  this.userForm.patchValue({
    roles: updatedRoles
  });

  // si es usuario nuevo no existe id todavía
  if (this.isNewUser()) return;

  try {

    await firstValueFrom(
      this.userService.updateUser(
        this.user()._id,
        {
          roles: updatedRoles
        }
      )
    );

    this.successMessage.set(
      'Roles actualizados correctamente'
    );

    this.wasSaved.set(true);

    setTimeout(() => {
      this.wasSaved.set(false);
    }, 2000);

  } catch (error) {

    console.error(error);

  }

}

  async onSubmit() {

    const isValid = this.userForm.valid;

    this.userForm.markAllAsTouched();

    if (!isValid) return;

    this.isPosting.set(true);

    try {

      const formValue = this.userForm.value;

      const userLike: Partial<User> = {
        ...(formValue as any),
      };

      if (!userLike.password?.trim()) {
        delete userLike.password;
      }

      if (this.isNewUser()) {

        const user = await firstValueFrom(
          this.userService.createUser(userLike)
        );

        this.router.navigate(['/users', user._id]);

      } else {

        await firstValueFrom(
          this.userService.updateUser(
            this.user()._id,
            userLike
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
