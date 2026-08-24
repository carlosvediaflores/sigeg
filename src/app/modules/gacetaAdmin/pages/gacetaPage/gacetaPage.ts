import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GacetaService } from '../../services/gaceta.service';
import { GacetaResponse, GacetaSimple } from '../../interfaces/gaceta.interface';
import { toSignal, toObservable, rxResource } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, firstValueFrom, map, startWith, switchMap, tap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, isActive, Router, RouterLink } from '@angular/router';
import { DatePipe, JsonPipe } from '@angular/common';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { Pagination } from '@shared/components/pagination/pagination';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';

const baseUrl = environment.baseUrl;

@Component({
  selector: 'app-gaceta-page',
  imports: [ Pagination, DatePipe, FormErrorLabel, ReactiveFormsModule,],
  templateUrl: './gacetaPage.html',
  styleUrls: ['./gacetaPage.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GacetaPage {
  gacetaService = inject(GacetaService);

  gaceta = signal<GacetaResponse[]>([]);

  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  router = inject(Router);

  selectedGacetaId = signal<string>('new');
  successMessage = signal('');
  wasSaved = signal(false);
  isPosting = signal(false);
  errorMessage = signal('');
  wasError = signal(false);
  selectedFile = signal<File | null>(null);
  selectedGacetaId$ = toObservable(this.selectedGacetaId);

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
        .pipe(tap((resp) => console.log('gacetas', resp))),
  });

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  year = new Date().getFullYear();

  tipoGacetaResource = rxResource({
    stream: () => this.gacetaService.gettipoGaceta(),
  });

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

  gacetaForm = this.fb.nonNullable.group({
    numero: [0, Validators.required],
    titulo: ['', Validators.required],
    fechaAprobacion: [this.getToday()],
    fechaPublicacion: [this.getToday()],
    tipo: ['', Validators.required],
    isActive: [true],
    isPublic: [false],
  });

  openNewModal() {
    this.selectedGacetaId.set('new');
    this.gacetaForm.reset({
      numero: 0,
      titulo: '',
      fechaAprobacion: this.getToday(),
      fechaPublicacion: this.getToday(),
      tipo: '',
      isActive: true,
      isPublic: false,

    });

    const modal = document.getElementById(
      'gaceta_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmit() {

    if (this.gacetaForm.invalid) {
      this.gacetaForm.markAllAsTouched();
      return;
    }

    this.isPosting.set(true);

    try {

      const formValue = this.gacetaForm.getRawValue();

      const formData = new FormData();


      formData.append(
        'numero',
        String(formValue.numero)
      );

      formData.append(
        'titulo',
        formValue.titulo
      );

      formData.append(
        'fechaAprobacion',
        formValue.fechaAprobacion
      );

      formData.append(
        'fechaPublicacion',
        formValue.fechaPublicacion
      );

      formData.append(
        'tipo',
        formValue.tipo
      );

      formData.append(
        'isActive',
        String(formValue.isActive)
      );

      formData.append(
        'isPublic',
        String(formValue.isPublic)
      );

      const file = this.selectedFile();

      if (file) {
        formData.append(
          'file',
          file,
          file.name
        );
      }
      console.log('Enviando Gaceta');

      if (this.selectedGacetaId() === 'new') {

        await firstValueFrom(
          this.gacetaService.createGaceta(formData)
        );

      } else {

        // Por ahora tu update sigue como estaba
        await firstValueFrom(
          this.gacetaService.updateGaceta(
            this.selectedGacetaId(),
            formData
          )
        );
      }

      this.gacetaResource.reload();

      this.gacetaForm.reset({
        numero: 0,
        titulo: '',
        fechaAprobacion: this.getToday(),
        fechaPublicacion: this.getToday(),
        tipo: '',
        isActive: true,
        isPublic: false,
      });

      this.selectedFile.set(null);

      const modal = document.getElementById(
        'gaceta_modal'
      ) as HTMLDialogElement;

      this.successMessage.set(
        this.selectedGacetaId() === 'new'
          ? 'Gaceta creada correctamente'
          : 'Gaceta actualizada correctamente'
      );

      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);

    } catch (error) {

      const err = error as HttpErrorResponse;

      console.error(error);

      this.errorMessage.set(
        err.error?.message ??
        err.message ??
        'Ocurrió un error inesperado.'
      );

      this.wasError.set(true);

      setTimeout(() => {
        this.wasError.set(false);
      }, 5000);

    } finally {

      this.isPosting.set(false);

    }
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile.set(null);
      return;
    }

    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      this.errorMessage.set('Solo se permiten archivos PDF');
      this.wasError.set(true);

      input.value = '';
      this.selectedFile.set(null);

      setTimeout(() => {
        this.wasError.set(false);
      }, 4000);

      return;
    }

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage.set(
        'El archivo no puede superar los 20 MB'
      );

      this.wasError.set(true);

      input.value = '';
      this.selectedFile.set(null);

      setTimeout(() => {
        this.wasError.set(false);
      }, 4000);

      return;
    }

    this.selectedFile.set(file);
  }

  getFieldError(fieldName: string): string | null {

    const control =
      this.gacetaForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }
}
