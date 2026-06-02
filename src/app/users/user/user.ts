import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { UserService } from '../services/user.service';
import { UserDetalles } from './user-detalles/user-detalles';
import { RolesService } from '../services/roles.service';

@Component({
  selector: 'app-user',
  imports: [UserDetalles],
  templateUrl: './user.html',
  styleUrl: './user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class User {
  activatedRoute = inject(ActivatedRoute);

  userService = inject(UserService);
  rolesService = inject(RolesService);

  router = inject(Router);

  userId = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['id'])
    ),
    {
      initialValue: '',
    }
  );

  userId$ =
    toObservable(this.userId);

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


  redirectEffect = effect(() => {

    if (this.userResource.error()) {

      this.router.navigate([
        'users/list'
      ]);

    }

  });
}
