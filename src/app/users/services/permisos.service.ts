
import { inject, Injectable } from '@angular/core';
import { Permiso, PermisosResponse } from '../interfaces/permisos.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
const baseUrl = environment.baseUrl;
interface Options {
  limit?: number;
  offset?: number;

}

const emptyPermiso: Permiso = {
  _id: 'new',
  name: '',
  description: '',
  method: '',
  urn: '',
};
@Injectable({
  providedIn: 'root',
})
export class PermisosService {
  private http = inject(HttpClient);

  getPermisos(options: Options): Observable<PermisosResponse> {
    const { limit = 9, offset = 0 } = options;

    return this.http.get<PermisosResponse>(`${baseUrl}/permisos`, {
      params: {
        limit,
        offset,
      },
    }).pipe(
      tap((resp) => console.log('resp', resp)),
    );
  }

  getPermisoById(id: string): Observable<Permiso> {
    if (id === 'new') {
      return of(emptyPermiso);
    }
    return this.http
      .get<Permiso>(`${baseUrl}/permisos/${id}`)
      .pipe(tap((resp) => console.log('permiso', resp)));
  }

  createPermiso(permiso: Partial<Permiso>) {
    return this.http.post<Permiso>(
      `${baseUrl}/permisos`,
      permiso
    );
  }

  updatePermiso(
    id: string,
    permiso: Partial<Permiso>
  ) {
    return this.http.patch<Permiso>(
      `${baseUrl}/permisos/${id}`,
      permiso
    );
  }

  getGroups() {
    return this.http.get<string[]>(`${baseUrl}/permisos/group/all`);
  }
}
