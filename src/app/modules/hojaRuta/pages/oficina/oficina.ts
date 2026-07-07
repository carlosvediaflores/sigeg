import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, tap, combineLatest, switchMap, firstValueFrom } from 'rxjs';
import { UserService } from '../../../../users/services/user.service';
import { HojaRutaService } from '../../services/hojaRuta.service';
import { SeguimientosService } from '../../services/seguimientos.service';
import { DatePipe } from '@angular/common';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { Pagination } from '@shared/components/pagination/pagination';
import { Seguimiento } from '../../interfaces/hojaRuta';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-oficina',
  imports: [RouterLink, Pagination, DatePipe, ReactiveFormsModule],
  templateUrl: './oficina.html',
  styleUrl: './oficina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Oficina {
  activatedRoute = inject(ActivatedRoute);

  seguiId = toSignal(
    this.activatedRoute.params.pipe(
      map((params) => params['id'])
    ),
    {
      initialValue: '',
    }
  );
  seguiId$ = toObservable(this.seguiId);

  hojaRutaService = inject(HojaRutaService);
  userService = inject(UserService);
  seguimientosService = inject(SeguimientosService);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

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
      ]).pipe(

        switchMap(([page, limit]) =>
          this.seguimientosService.getSeguimientos({

            offset: (page - 1) * limit,
            limit,
          })
        )
      )
        .pipe(tap((resp) => console.log('Seguimientos', resp))),
  });

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
