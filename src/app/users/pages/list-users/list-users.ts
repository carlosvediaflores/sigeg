import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../services/user.service';
import { User } from '@auth/interfaces/user.interface';
import { CurrencyPipe, LowerCasePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsersResponse } from '../../interfaces/user.interface';
import { map, distinctUntilChanged, switchMap, combineLatest } from 'rxjs';
import { Pagination } from '@shared/components/pagination/pagination';

@Component({
  selector: 'app-list-users',
  imports: [RouterLink, UpperCasePipe, TitleCasePipe, Pagination],
  templateUrl: './list-users.html',
  styleUrl: './list-users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListUsers  {

  userService = inject(UserService);
  public users = signal<UsersResponse[] | null>(null);



  route = inject(ActivatedRoute);
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

  usersPerPage = signal(10);
     currentPage$ = toObservable(this.currentPage);

    usersPerPage$ =
    toObservable(this.usersPerPage);

  usersResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.usersPerPage$,
      ]).pipe(

        switchMap(([ page, limit]) =>
          this.userService.getUsers({
         
            offset: (page - 1) * limit,
            limit,
          })
        )
      ),
  });

  getUserRole(user: User): string {

    if (!user.roles?.length) {
      return 'Sin rol';
    }

    return user.roles
      .map(role => role.name)
      .join(', ');
  }

}