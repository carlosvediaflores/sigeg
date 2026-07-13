import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, tap, combineLatest, switchMap, firstValueFrom, of, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { UserService } from '../../../../users/services/user.service';
import { HojaRutaService } from '../../services/hojaRuta.service';
import { SeguimientosService } from '../../services/seguimientos.service';
import { DatePipe } from '@angular/common';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { Pagination } from '@shared/components/pagination/pagination';
import { Seguimiento } from '../../interfaces/hojaRuta';
import Swal from 'sweetalert2';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-oficina',
  imports: [RouterLink, Pagination, DatePipe, ReactiveFormsModule],
  templateUrl: './oficina.html',
  styleUrl: './oficina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Oficina {
  activatedRoute = inject(ActivatedRoute);
  authService = inject(AuthService);
  user = computed(() => this.authService.user());
  wasSaved = signal(false);
  successMessage = signal('');
  seguiId = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['id'])
    ),
    {
      initialValue: '',
    }
  );
  seguiId$ = toObservable(this.seguiId);
  selectedSeguiId = signal('');
  selectedSeguiId$ = toObservable(this.selectedSeguiId);
  selectedHrId = signal('');
  selectedHrId$ = toObservable(this.selectedHrId);
  hojaRutaService = inject(HojaRutaService);
  userService = inject(UserService);
  seguimientosService = inject(SeguimientosService);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  year = new Date().getFullYear();


  searchFormSegui = this.fb.group({
    gestion: [this.year],
    termino: [''],
    estado: [''],
    numeroHr: [''],
    destinoUser: [this.user()?._id ?? '' ],
    idUnidadOrgDest: [this.user()?.idUnidadOrg?._id ?? '' ],
    idUnidadFuncDest: [this.user()?.idUnidadFuncional?._id ?? '' ],
    idSubUnidadDest: [this.user()?.idSubUnidad?._id ?? '' ],
  });

  searchFormSegui$ = this.searchFormSegui.valueChanges.pipe(
  debounceTime(300),
  startWith(this.searchFormSegui.getRawValue())
);
  
  usersResource = rxResource({
    stream: () => this.userService.getUsers({ limit: 1000 })
      .pipe(tap((resp) => console.log('Users', resp))),
  });

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
  seguimientosPerPage = signal(10);
  currentPage$ = toObservable(this.currentPage);

  seguimientosPerPage$ =
    toObservable(this.seguimientosPerPage);

  seguimientosResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.seguimientosPerPage$,
        this.searchFormSegui$,
      ]).pipe(

        switchMap(([page, limit, filters]) =>
          this.seguimientosService.getSeguimientos({

            offset: (page - 1) * limit,
            limit,
            ...filters,
          })
        )
      )
        .pipe(tap((resp) => console.log('Seguimientos', resp))),
  });

  selectedSeguiResource = rxResource({
    stream: () =>
      this.selectedSeguiId$.pipe(
        switchMap(id =>
          id
            ? this.seguimientosService.getSegui(id)
            : of(null)
        )
      )
  });

  selectedHrResource = rxResource({
    stream: () =>
      this.selectedHrId$.pipe(
        switchMap(id =>
          id
            ? this.hojaRutaService.getHojaRuta(id)
            : of(null)
        )
      )
  });

  getTiempoPendiente(fecha: string | Date): string {

    const inicio = new Date(fecha).getTime();
    const ahora = Date.now();

    const diff = ahora - inicio;

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${dias}d ${horas}h ${minutos}m`;
  }
  openSeguiModal(hojaRuta: any) {

    console.log('Hoja de Ruta seleccionada', hojaRuta);

    this.selectedHrId.set(hojaRuta._id);

    const modal = document.getElementById(
      'segui_modal'
    ) as HTMLDialogElement;

    modal.showModal();
  }
  async changeStatus(segui: Seguimiento) {

    const result = await Swal.fire({
      title: '¿Recibir documento?',
      text: `Hoja de Ruta Nº ${segui.numeroHr}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, recibir',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    await firstValueFrom(
      this.seguimientosService.updateSeguimiento(
        segui._id,
        { estado: 'RECIBIDO' }
      )
    );

    this.seguimientosResource.reload();

    Swal.fire(
      'Actualizado',
      'La hoja de ruta fue marcada como RECIBIDO',
      'success'
    );
  }

}
