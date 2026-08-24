import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GacetaService } from '../../services/gaceta.service';
import { TipoGacetaInterface } from '../../interfaces/gaceta.interface';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';



@Component({
  selector: 'app-tipo-gaceta',
  imports: [ReactiveFormsModule, FormErrorLabel],
  templateUrl: './tipoGaceta.html',
  styleUrls: ['./tipoGaceta.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipoGaceta {
  gacetaService = inject(GacetaService);
  public tipoGaceta = signal<TipoGacetaInterface[] | null>(null);

  fb = inject(FormBuilder);

  selectedTipoGacetaId = signal<string>('new');
  successMessage = signal('');

  isPosting = signal(false);
  wasSaved = signal(false);

  tipoGacetaForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    description: ['', Validators.required],
  });

  tipoGacetaResource = rxResource({
    stream: () => this.gacetaService.gettipoGaceta(),
  });


  openNewModal() {

    this.selectedTipoGacetaId.set('new');

    this.tipoGacetaForm.reset({
      nombre: '',
      description: '',
    });

    const modal = document.getElementById(
      'tipo_gaceta_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  openEditModal(tipoGaceta: TipoGacetaInterface) {

    this.selectedTipoGacetaId.set(tipoGaceta._id);

    this.tipoGacetaForm.reset({
      nombre: tipoGaceta.nombre,
      description: tipoGaceta.description,
    });

    const modal = document.getElementById(
      'tipo_gaceta_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmit() {

    if (this.tipoGacetaForm.invalid) {

      this.tipoGacetaForm.markAllAsTouched();
      return;

    }

    this.isPosting.set(true);

    try {

      const tipoLike =
        this.tipoGacetaForm.getRawValue();

      if (this.selectedTipoGacetaId() === 'new') {

        await firstValueFrom(
          this.gacetaService.createTipoGaceta(tipoLike)
        );

      } else {

        await firstValueFrom(
          this.gacetaService.updateTipoGaceta(
            this.selectedTipoGacetaId(),
            tipoLike
          )
        );
      }
      this.tipoGacetaResource.reload();

      this.tipoGacetaForm.reset({
        nombre: '',
        description: '',
      });


      const modal = document.getElementById(
        'tipo_gaceta_modal'
      ) as HTMLDialogElement;

      if (this.selectedTipoGacetaId() === 'new') {
        this.successMessage.set('Tipo de gaceta creado correctamente');
      } else {
        this.successMessage.set('Tipo de gaceta actualizado correctamente');
      }

      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);

    } finally {

      this.isPosting.set(false);

    }

  }


  deleteTipoGaceta(id: string) {

    const confirmation = confirm(
      '¿Estás seguro de que deseas eliminar este tipo de gaceta?'
    );

    if (!confirmation) {
      return;
    }

    firstValueFrom(this.gacetaService.deleteTipoGaceta(id))
      .then(() => {
        this.tipoGacetaResource.reload();
        alert('Tipo de gaceta eliminado correctamente');
      })
      .catch((error) => {
        console.error('Error al eliminar el tipo de gaceta:', error);
        alert('Ocurrió un error al eliminar el tipo de gaceta');
      });
  }

  eliminarTipo(tipoGaceta: TipoGacetaInterface) {
    this.deleteTipoGaceta(tipoGaceta._id);
  }

  getFieldError(fieldName: string): string | null {

    const control =
      this.tipoGacetaForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }
}
