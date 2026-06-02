import { ChangeDetectionStrategy, Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { DatePipe, JsonPipe } from '@angular/common';
import { distinctUntilChanged, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { Role } from '../../interfaces/roles.interface';
import { RolesService } from '../../services/roles.service';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-detalles',
  imports: [ReactiveFormsModule, FormErrorLabel, JsonPipe],
  templateUrl: './user-detalles.html',
  styleUrl: './user-detalles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetalles implements OnInit {
  //user = input.required<User>();
  // roles = input<Role[] | null>(null);
  //userSignal = signal<User | null>(null);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  userService = inject(UserService);
  rolesService = inject(RolesService);
  wasSaved = signal(false);
  isPosting = signal(false);
  successMessage = signal('');

  userId = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['id'])
    ),
    {
      initialValue: '',
    }
  );

  userId$ = toObservable(this.userId);

  getFieldError(fieldName: string): string | null {

    const control = this.userForm.get(fieldName);

    if (!control) return null;

    if (!control.touched) return null;

    const errors = control.errors ?? {};

    return Object.keys(errors).length > 0
      ? FormUtils.getTextError(errors)
      : null;
  }

  userForm = this.fb.nonNullable.group({
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

    this.setFormValue(this.userResource.value() ?? {});

    this.userForm.patchValue({
      roles: this.userResource.value()?.roles ?? []
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

  constructor() {

    effect(() => {

      const user = this.userResource.value();

      if (!user) return;

      this.setFormValue(user);

    });

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
  isNewUser(): boolean {
    return this.userId() === 'new';
  }

  userResource = rxResource({
    stream: () =>
      this.userId$.pipe(

        distinctUntilChanged(),

        switchMap((id) =>
          this.userService.getUserById(id)
        )
      )
        .pipe(tap((resp) => console.log('user', resp)))
  });

  rolesResource = rxResource({
    stream: () => this.rolesService.getRoles()
      .pipe(tap((resp) => console.log('roles', resp)))
  });


 hasRole(roleId: string): boolean {

  if (this.isNewUser()) {

    const roles =
      this.userForm.get('roles')?.value ?? [];

    return roles.some((r: any) =>
      typeof r === 'string'
        ? r === roleId
        : r._id === roleId
    );
  }

  return (
    this.userResource.value()?.roles?.some(
      role => role._id === roleId
    ) ?? false
  );

}

  async toggleRoles(role: Role) {

    // NUEVO USUARIO
    if (this.isNewUser()) {

      const currentRoles = this.userForm.get('roles')?.value ?? [];

      const exists = currentRoles.some(
        r => r._id === role._id
      );

      const roles = exists
        ? currentRoles.filter(
          r => r._id !== role._id
        )
        : [
          ...currentRoles,
          role
        ];

      this.userForm.patchValue({
        roles
      });

      return;
    }

    // USUARIO EXISTENTE
    const user = this.userResource.value();

    if (!user) return;

    const exists = user.roles.some(
      r => r._id === role._id
    );

    const roles = exists
      ? user.roles.filter(
        r => r._id !== role._id
      )
      : [
        ...user.roles,
        role
      ];

    try {

      await firstValueFrom(
        this.userService.updateUser(
          user._id,
          {
            roles
          }
        )
      );

      this.userResource.reload();

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
            this.userResource.value()?._id!,
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
