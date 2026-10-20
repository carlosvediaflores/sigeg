
import { inject, Injectable } from '@angular/core';
import { Permiso, PermisosResponse } from '../interfaces/permisos.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
const baseUrl = environment.baseUrl;

export interface Backup {
  nombre: string;
  tamano: number;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private http = inject(HttpClient);



  private readonly apiUrl =
    `${baseUrl}/configuration`;

  listar(): Observable<Backup[]> {
    return this.http.get<Backup[]>(this.apiUrl);
  }

  descargar(nombre: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${encodeURIComponent(nombre)}/descargar`,
      { responseType: 'blob' },
    );
  }

  guardarArchivo(blob: Blob, nombre: string): void {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombre;
    enlace.click();

    URL.revokeObjectURL(url);
  }

  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const unidades = ['Bytes', 'KB', 'MB', 'GB'];
    const indice = Math.floor(
      Math.log(bytes) / Math.log(1024),
    );

    return `${(bytes / Math.pow(1024, indice)).toFixed(2)} ${unidades[indice]}`;
  }

  restaurar(nombre: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.apiUrl}/${encodeURIComponent(nombre)}/restaurar`,
      {},
    );
  }


  restaurarArchivoLocal(
    archivo: File,
  ): Observable<{ mensaje: string }> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post<{ mensaje: string }>(
      `${this.apiUrl}/restaurar-archivo`,
      formData,
    );
  }


  crearBackupManual(): Observable<{
    mensaje: string;
    archivo: string;
  }> {
    return this.http.post<{
      mensaje: string;
      archivo: string;
    }>(`${this.apiUrl}/crear`, {});
  }


}
