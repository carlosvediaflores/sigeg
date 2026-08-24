import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DocumentoGaceta } from '../../interfaces/hero-slide.interface';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { map, combineLatest, switchMap, debounceTime, startWith } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GacetaService } from '../../../modules/gacetaAdmin/services/gaceta.service';
import { DatePipe } from '@angular/common';
import { GacetaSimple } from '../../../modules/gacetaAdmin/interfaces/gaceta.interface';
import { environment } from '../../../../environments/environment';

const baseUrl = environment.baseUrl;
@Component({
    selector: 'app-gaceta',
    imports: [ReactiveFormsModule, DatePipe],
    templateUrl: './gaceta.html',
    styleUrls: ['./gaceta.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gaceta {

     errorMessage = signal('');
  wasError = signal(false);
    gacetaService = inject(GacetaService);
    
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);
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

    year = new Date().getFullYear();

    searchFormGaceta = this.fb.group({
    gestion: [this.year],
    termino: [''],
    isActive: [''],
    isPublic: [''],
    tipo: [''],
  });

  searchFormGaceta$ = this.searchFormGaceta.valueChanges.pipe(
        debounceTime(300),
        startWith(this.searchFormGaceta.getRawValue())
      );

    gacetaPerPage = signal(20);
    currentPage$ = toObservable(this.currentPage);

    gacetaPerPage$ = toObservable(this.gacetaPerPage);



    gacetaResource = rxResource({
        stream: () =>
            combineLatest([
                this.currentPage$,
                this.gacetaPerPage$,
                this.searchFormGaceta$,
            ]).pipe(

                switchMap(([page, limit, filters]) => {
                    return this.gacetaService.getGacetas({
                        offset: (page - 1) * limit,
                        limit,
                        ...filters,
                    });
                })
            )
    });

     tipoGacetaResource = rxResource({
    stream: () => this.gacetaService.gettipoGaceta(),
  });

   formatFileSize(size?: number): string {
    if (!size) return '0 KB';

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  openGacetaPdf(gaceta: GacetaSimple) {
  
      if (!gaceta.archivo) {
        this.errorMessage.set(
          'Esta gaceta no tiene un documento PDF'
        );
  
        this.wasError.set(true);
  
        setTimeout(() => {
          this.wasError.set(false);
        }, 4000);
  
        return;
      }
  
      const url =
        `${baseUrl}/gaceta/archivo/${encodeURIComponent(gaceta.archivo)}`;
  
      window.open(url, '_blank');
  
    }
}
