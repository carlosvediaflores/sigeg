import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../../../users/services/user.service';
import { SeguimientosService } from '../../services/seguimientos.service';
import { ArchivadosResponse } from '../../interfaces/hojaRuta';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, map, startWith, switchMap } from 'rxjs';
import { AuthService } from '@auth/services/auth.service';

const baseUrl = environment.baseUrl;

@Component({
  selector: 'app-archivados',
  imports: [],
  templateUrl: './archivados.html',
  styleUrl: './archivados.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Archivados {
 authService = inject(AuthService);
  user = computed(() => this.authService.user());
  seguimientosService = inject(SeguimientosService);

  archivados = signal<ArchivadosResponse[]>([]);

  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  router = inject(Router);

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

  gacetaPerPage = signal(20);
  currentPage$ = toObservable(this.currentPage);

  gacetaPerPage$ = toObservable(this.gacetaPerPage);

  gacetaResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.gacetaPerPage$,
        this.searchFormArchivados$,
      ]).pipe(

        switchMap(([page, limit, filters]) => {
          return this.seguimientosService.getArchivados({
            offset: (page - 1) * limit,
            limit,
             ...filters,
          });
        })
      )
  });

   searchFormArchivados = this.fb.group({
    nombre: [''],
    descripcion: [''],
    destinoUser: [this.user()?._id ?? ''],
    idUnidadOrgDest: [this.user()?.idUnidadOrg?._id ?? ''],
    idUnidadFuncDest: [this.user()?.idUnidadFuncional?._id ?? ''],
    idSubUnidadDest: [this.user()?.idSubUnidad?._id ?? ''],
  });

   searchFormArchivados$ = this.searchFormArchivados.valueChanges.pipe(
      debounceTime(300),
      startWith(this.searchFormArchivados.getRawValue())
    );
}
