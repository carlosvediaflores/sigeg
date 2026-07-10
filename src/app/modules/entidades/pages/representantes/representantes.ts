import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RepresentanteService } from '../../services/representante.service';
import { combineLatest, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { Pagination } from '@shared/components/pagination/pagination';

@Component({
  selector: 'app-representantes',
  imports: [Pagination, ReactiveFormsModule,],
  templateUrl: './representantes.html',
  styleUrl: './representantes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Representantes {
  private representanteService = inject(RepresentanteService);
  route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  wasSaved = signal(false);
  isPosting = signal(false);

  searchForm = this.fb.group({
    tipoEntidad: [''],
    termino: [''],
    isActive: [''],
  });

  searchForm$ = this.searchForm.valueChanges.pipe(
      startWith(this.searchForm.value),
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
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
  represPerPage = signal(20);
  currentPage$ = toObservable(this.currentPage);
  successMessage = signal('');
  represPerPage$ =
    toObservable(this.represPerPage);


  represResource = rxResource({
    stream: () =>
      combineLatest([
        this.currentPage$,
        this.represPerPage$,
        this.searchForm$,
      ]).pipe(
        switchMap(([page, limit, filters]) =>
          this.representanteService.getRepresentante({
            offset: (page - 1) * limit,
            limit,
            ...filters,
          })
        )
      ),
  });
}
