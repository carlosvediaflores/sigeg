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
}
