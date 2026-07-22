import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { OrgService } from '../../services/org.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom, tap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubUnidad, Org, UnidadFuncional } from '../../interfaces/org.interface';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { JsonPipe } from '@angular/common';
import Swal from 'sweetalert2'
import { UserService } from '../../../../users/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-org-list',
  imports: [ReactiveFormsModule, FormErrorLabel,],
  templateUrl: './org-list.html',
  styleUrl: './org-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgList {
  private activatedRoute = inject(ActivatedRoute);
  private orgService = inject(OrgService);
  userService = inject(UserService);

  fb = inject(FormBuilder);
  selectedOrgId = signal<string>('new');
  selectedUniOrgId = signal<string>('new');
  selectedCargoId = signal<string>('new');

  org = signal<Org | null>(null);
  unidadFuncional = signal<UnidadFuncional | null>(null);
  cargo = signal<SubUnidad | null>(null);

  successMessage = signal('');
  errorMessage = signal('');
  wasSaved = signal(false);
  wasError = signal(false);
  isPosting = signal(false);
  isPostingUni = signal(false);
  isPostingCargo = signal(false);

  orgForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    sigla: ['', Validators.required],
    codigo: [0,],
    cargo: ['', Validators.required],
    persona: [''],
    unidadFuncional: [[] as Org['unidadFuncional']],
  });

  unitForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    sigla: ['', Validators.required],
    codigo: [0,],
    cargo: ['', Validators.required],
    persona: [''],
    subUnidad: [[] as SubUnidad[]],
    idUnidadOrg: [''],
  });

  subForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    sigla: ['', Validators.required],
    codigo: [0,],
    cargo: ['', Validators.required],
    persona: [''],
    unidadFuncional: [''],
  });

  orgsResource = rxResource({
    stream: () => this.orgService.getOrgs()
      .pipe(tap((resp) => console.log('orgs', resp))),
  });

  usersResource = rxResource({
    stream: () => this.userService.getUsers({ limit: 1000 })
      .pipe(tap((resp) => console.log('Users', resp))),
  });

  openNewModal() {

    this.selectedOrgId.set('new');

    this.orgForm.reset({
      nombre: '',
      sigla: '',
      codigo: 0,
      cargo: '',
      persona: '',
      unidadFuncional: [],
    });

    const modal = document.getElementById(
      'org_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  openEditModal(org: Org) {

    this.selectedOrgId.set(org._id);

    this.orgForm.reset({
      nombre: org.nombre,
      sigla: org.sigla,
      codigo: org.codigo,
      cargo: org.cargo,
      persona:
        typeof org.persona === 'string'
          ? org.persona
          : org.persona?._id,
      unidadFuncional: org.unidadFuncional,
    });

    const modal = document.getElementById(
      'org_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmit() {

    if (this.orgForm.invalid) {

      this.orgForm.markAllAsTouched();
      return;

    }

    this.isPosting.set(true);

    try {

      const orgLike =
        this.orgForm.getRawValue();

      const { persona, ...orgPayload } = orgLike;

      if (this.selectedOrgId() === 'new') {

        await firstValueFrom(
          this.orgService.createOrg(orgPayload)
        );

      } else {

        await firstValueFrom(
          this.orgService.updateOrg(
            this.selectedOrgId(),
            orgPayload
          )
        );
      }
      this.orgsResource.reload();

      this.orgForm.reset({
        nombre: '',
        sigla: '',
        codigo: 0,

        unidadFuncional: [] as Org['unidadFuncional'],
      });


      const modal = document.getElementById(
        'org_modal'
      ) as HTMLDialogElement;

      this.successMessage.set(
        this.selectedOrgId() === 'new'
          ? 'Organización creada correctamente'
          : 'Organización actualizada correctamente'
      );

      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);
    }catch (error) {

      const err = error as HttpErrorResponse;

      this.errorMessage.set(
        err.error?.message ??
        err.message ??
        'Ocurrió un error inesperado.'
      );

      this.wasError.set(true);

      setTimeout(() => {
        this.wasError.set(false);
      }, 5000);

    }
     finally {

      this.isPosting.set(false);
    }

  }
  async changeStatus(org: Org, event: Event) {

    const checked = (event.target as HTMLInputElement).checked;

    try {

      await firstValueFrom(
        this.orgService.updateOrg(
          org._id,
          {
            isActive: checked
          }
        )
      );

      org.isActive = checked;

      this.successMessage.set(
        'Estado actualizado correctamente'
      );

      this.wasSaved.set(true);

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 2000);

    } catch (error) {

      // Si falla vuelve al estado anterior
      (event.target as HTMLInputElement).checked =
        !checked;

      console.error(error);

    }

  }

  getFieldError(fieldName: string): string | null {

    const control =
      this.orgForm.get(fieldName);

    if (!control?.touched) return null;

    if (control.hasError('required')) {
      return 'Campo requerido';
    }

    return null;
  }

  deleteOrg(org: Org) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la organización ${org.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orgService.deleteOrg(org._id).subscribe(() => {
          Swal.fire(
            '¡Eliminada!',
            `La organización ${org.nombre} ha sido eliminada.`,
            'success'
          );
          this.orgsResource.reload();
        });
      }
    });
  }

  openNewUnidad(org: Org) {

    this.selectedUniOrgId.set('new');

    this.unitForm.reset({
      nombre: '',
      sigla: '',
      codigo: 0,
      cargo: '',
      persona: '',
      idUnidadOrg: org._id,
    });

    const modal = document.getElementById(
      'unidad_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  openEditUnidad(UnidadFunional: UnidadFuncional) {

    this.selectedUniOrgId.set(UnidadFunional._id);

    console.log('Unidad Funcional:', UnidadFunional);

    this.unitForm.reset({
      nombre: UnidadFunional.nombre,
      sigla: UnidadFunional.sigla,
      codigo: UnidadFunional.codigo,
      cargo: UnidadFunional.cargo,
      persona:
        typeof UnidadFunional.persona === 'string'
          ? UnidadFunional.persona
          : UnidadFunional.persona?._id,
      idUnidadOrg: UnidadFunional.idUnidadOrg,
      subUnidad: UnidadFunional.subUnidad
    });

    const modal = document.getElementById(
      'unidad_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmitUnidad() {

    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }

    this.isPostingUni.set(true);

    try {

      const uniLike = this.unitForm.getRawValue();

      if (this.selectedUniOrgId() === 'new') {

        await firstValueFrom(
          this.orgService.createUnidadFuncional(uniLike)
        );

      } else {

        await firstValueFrom(
          this.orgService.updateUnidadFuncional(
            this.selectedUniOrgId(),
            uniLike
          )
        );

      }

      this.orgsResource.reload();

      this.unitForm.reset({
        nombre: '',
        sigla: '',
        codigo: 0,
        idUnidadOrg: '',
        cargo: '',
        persona: '',
        subUnidad: [],
      });

      const modal = document.getElementById(
        'unidad_modal'
      ) as HTMLDialogElement;

      this.successMessage.set(
        this.selectedUniOrgId() === 'new'
          ? 'Unidad Funcional creada correctamente'
          : 'Unidad Funcional actualizada correctamente'
      );

      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);

    } catch (error) {

      const err = error as HttpErrorResponse;

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

      this.isPostingUni.set(false);

    }
  }

  deleteUnidad(uni: UnidadFuncional) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la unidad funcional ${uni.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orgService.deleteUnidadFuncional(uni._id).subscribe(() => {
          Swal.fire(
            '¡Eliminada!',
            `La unidad funcional ${uni.nombre} ha sido eliminada.`,
            'success'
          );
          this.orgsResource.reload();
        });
      }
    });
  }

  openNewCargo(unidad: UnidadFuncional) {

    this.selectedCargoId.set('new');

    this.subForm.reset({
      nombre: '',
      sigla: '',
      codigo: 0,
      cargo: '',
      persona: '',
      unidadFuncional: unidad._id,
    });

    const modal = document.getElementById(
      'cargo_modal'
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  async onSubmitCargo() {

    if (this.subForm.invalid) {

      this.subForm.markAllAsTouched();
      return;

    }

    this.isPostingCargo.set(true);

    try {

      const cargoLike =
        this.subForm.getRawValue();

      if (this.selectedCargoId() === 'new') {

        await firstValueFrom(
          this.orgService.createCargo(cargoLike)
        );

      } else {

        await firstValueFrom(
          this.orgService.updateCargo(
            this.selectedCargoId(),
            cargoLike
          )
        );
      }
      this.orgsResource.reload();

      this.subForm.reset({
        nombre: '',
        sigla: '',
        codigo: 0,
        cargo: '',
        persona: '',
        unidadFuncional: '',
      });


      const modal = document.getElementById(
        'cargo_modal'
      ) as HTMLDialogElement;

       this.successMessage.set(
        this.selectedCargoId() === 'new'
          ? 'Sub Unidad creada correctamente'
          : 'Sub Unidad actualizada correctamente'
      );

      this.wasSaved.set(true);

      modal.close();

      setTimeout(() => {
        this.wasSaved.set(false);
      }, 3000);
    }  catch (error) {

      const err = error as HttpErrorResponse;

      this.errorMessage.set(
        err.error?.message ??
        err.message ??
        'Ocurrió un error inesperado.'
      );

      this.wasError.set(true);

      setTimeout(() => {
        this.wasError.set(false);
      }, 5000);

    }
    finally {

      this.isPostingCargo.set(false);
    }

  }
}
