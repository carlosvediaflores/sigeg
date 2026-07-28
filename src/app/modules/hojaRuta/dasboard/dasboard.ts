import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HojaRutaService } from '../services/hojaRuta.service';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, combineLatest, switchMap, tap, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SeguimientosService } from '../services/seguimientos.service';

@Component({
  selector: 'app-dasboard',
  imports: [],
  templateUrl: './dasboard.html',
  styleUrl: './dasboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dasboard {
  hojaRutaService = inject(HojaRutaService);
  seguimientosService = inject(SeguimientosService);
  dashboard = toSignal(this.hojaRutaService.getHojaRutas({}));
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  router = inject(Router);

  year = new Date().getFullYear();
  seguimientoDashboard = computed(() => 
  this.seguimientosResource.value()
);
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

  hojaRutaPerPage = signal(10);
  currentPage$ = toObservable(this.currentPage);

  searchFormHR = this.fb.group({
    gestion: [this.year],
    termino: [''],
    estado: [''],
    numero: [''],
  });
  hojaRutaPerPage$ =
    toObservable(this.hojaRutaPerPage);

  searchFormHR$ = this.searchFormHR.valueChanges.pipe(
    startWith(this.searchFormHR.value),
    debounceTime(300),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );
  hojaRutaResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.hojaRutaPerPage$,
        this.searchFormHR$,
      ]).pipe(

        switchMap(([page, limit, filters]) =>
          this.hojaRutaService.getHojaRutas({

            offset: (page - 1) * limit,
            limit,
            ...filters,
          })
        )
      )
        .pipe(tap((resp) => console.log('hojasRuta', resp))),
  });


  seguimientosPerPage = signal(10);

  searchFormSegui = this.fb.group({
    gestion: [this.year],
    termino: [''],
    estado: [''],
    numero: [''],
  });
  searchFormSegui$ = this.searchFormSegui.valueChanges.pipe(
    startWith(this.searchFormSegui.value),
    debounceTime(300),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );
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
}
