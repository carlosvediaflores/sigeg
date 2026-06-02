import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RolesService } from '../services/roles.service';
import { ActivatedRoute } from '@angular/router';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map, switchMap, tap } from 'rxjs';
import { PermisosService } from '../services/permisos.service';
import { Permiso } from '../interfaces/permisos.interface';

@Component({
  selector: 'app-roles',
  imports: [],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Roles {

  private activatedRoute = inject(ActivatedRoute);
  private permisosService = inject(PermisosService);
  rolesService = inject(RolesService);
  rolId = toSignal(
    this.activatedRoute.params.pipe(
      map(params => params['id'])
    )
  );
  rolId$ = toObservable(this.rolId);
  wasSaved = signal(false);
  successMessage = signal('');

  groupedPermissions = computed<[string, Permiso[]][]>(() => {

    const groups = this.permisosGroupResource.value();

    if (!groups) return [];

    return Object.entries(groups) as unknown as [string, Permiso[]][];

  });

  hasPermission(permissionId: string): boolean {
    return (
      this.rolResource.value()?.permissions?.some(
        p => p._id === permissionId
      ) ?? false
    );
  }

  async togglePermission(permiso: Permiso) {

    const role = this.rolResource.value();

    if (!role) return;

    const exists = role.permissions.some(
      p => p._id === permiso._id
    );

    const permissions = exists
      ? role.permissions.filter(
        p => p._id !== permiso._id
      )
      : [
        ...role.permissions,
        permiso
      ];

    try {

      await firstValueFrom(
        this.rolesService.updateRole(
          role._id,
          {
            permissions: permissions
          }
        )
      );

      this.rolResource.reload();

      // Actualizar localmente
      this.rolResource.set?.({
        ...role,
        permissions
      });
      this.successMessage.set('Permiso actualizado correctamente');
      this.wasSaved.set(true);

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 2000);

    } catch (error) {

      console.error(error);

    }

  }
  rolResource = rxResource({
    stream: () => this.rolId$.pipe(
      switchMap(id => this.rolesService.getRoleById(id))
    ).pipe(tap(resp => console.log('rol', resp)))
  });

  permisosGroupResource = rxResource({
    stream: () => this.permisosService.getGroups()
      .pipe(tap(resp => console.log('permisos groups', resp)))
  });



}
