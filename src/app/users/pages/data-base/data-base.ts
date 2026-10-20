import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Backup, DbService } from '../../services/db.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-data-base',
  imports: [DatePipe],
  templateUrl: './data-base.html',
  styleUrl: './data-base.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataBase {
  private readonly backupsService = inject(DbService);

  backups = signal<Backup[]>([]);
  cargando = signal(false);
  descargando = signal<string | null>(null);
  error = signal('');

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.backupsService.listar().subscribe({
      next: (datos) => {
        this.backups.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los backups.');
        this.cargando.set(false);
      },
    });
  }

  descargar(backup: Backup): void {
    this.descargando.set(backup.nombre);
    this.error.set('');

    this.backupsService.descargar(backup.nombre).subscribe({
      next: (archivo) => {
        this.backupsService.guardarArchivo(
          archivo,
          backup.nombre,
        );
        this.descargando.set(null);
      },
      error: () => {
        this.error.set('Error al descargar el backup.');
        this.descargando.set(null);
      },
    });
  }

  tamano(bytes: number): string {
    return this.backupsService.formatearTamano(bytes);
  }

  restaurar(backup: Backup): void {
    const confirmado = window.confirm(
      `¿Restaurar SIGEG desde ${backup.nombre}?\n\n` +
      'Se creará primero un backup de seguridad. ' +
      'La restauración reemplazará las colecciones ' +
      'correspondientes a la base de datos seleccionada.'
    );

    if (!confirmado) return;

    this.descargando.set(backup.nombre);
    this.error.set('');

    this.backupsService.restaurar(backup.nombre).subscribe({
      next: (respuesta) => {
        window.alert(respuesta.mensaje);
        this.descargando.set(null);
        this.listar();
      },
      error: (err) => {
        this.error.set(
          err.error?.message ??
          'No se pudo restaurar el backup. Verifica los logs del servidor.',
        );
        this.descargando.set(null);
      },
    });
  }


  modalRestaurar = signal(false);
  archivoSeleccionado = signal<File | null>(null);
  restaurando = signal(false);

  abrirModalRestaurar(): void {
    this.error.set('');
    this.archivoSeleccionado.set(null);
    this.modalRestaurar.set(true);
  }

  cerrarModalRestaurar(): void {
    if (this.restaurando()) return;

    this.modalRestaurar.set(false);
    this.archivoSeleccionado.set(null);
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.error.set('');

    if (!archivo) {
      this.archivoSeleccionado.set(null);
      return;
    }

    if (!archivo.name.endsWith('.archive.gz')) {
      this.error.set(
        'Selecciona un archivo con extensión .archive.gz',
      );
      this.archivoSeleccionado.set(null);
      input.value = '';
      return;
    }

    this.archivoSeleccionado.set(archivo);
  }

  restaurarArchivoLocal(): void {
    const archivo = this.archivoSeleccionado();

    if (!archivo || this.restaurando()) return;

    const confirmado = window.confirm(
      `¿Restaurar SIGEG usando "${archivo.name}"?\n\n` +
      'Esta operación modificará la base de datos actual. ' +
      'Se intentará crear un backup de seguridad antes de continuar.',
    );

    if (!confirmado) return;

    this.restaurando.set(true);
    this.error.set('');

    this.backupsService.restaurarArchivoLocal(archivo).subscribe({
      next: (respuesta) => {
        window.alert(respuesta.mensaje);
        this.restaurando.set(false);
        this.modalRestaurar.set(false);
        this.archivoSeleccionado.set(null);
        this.listar();
      },
      error: (err) => {
        this.error.set(
          err.error?.message ??
          'No se pudo restaurar el archivo. Revisa los logs del backend.',
        );
        this.restaurando.set(false);
      },
    });
  }


  creandoBackup = signal(false);

  crearBackupManual(): void {
    if (this.creandoBackup() || this.restaurando()) {
      return;
    }

    const confirmado = window.confirm(
      '¿Crear una copia de seguridad de la base de datos ' +
      'actual de SIGEG?'
    );

    if (!confirmado) return;

    this.creandoBackup.set(true);
    this.error.set('');

    this.backupsService.crearBackupManual().subscribe({
      next: (respuesta) => {
        this.creandoBackup.set(false);

        window.alert(
          `${respuesta.mensaje}\n\nArchivo: ${respuesta.archivo}`
        );

        this.listar();
      },
      error: (err) => {
        this.creandoBackup.set(false);

        this.error.set(
          err.error?.message ??
          'No se pudo crear la copia de seguridad. ' +
          'Verifica los logs del backend.'
        );
      },
    });
  }


}
