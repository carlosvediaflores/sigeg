import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Entidad, EntidadResponse } from '../interfaces/entidad.interface';
const baseUrl = environment.baseUrl;


@Injectable({
  providedIn: 'root',
})
export class EntidadService {
  private http = inject(HttpClient);

  getEntidad(options: Options): Observable<EntidadResponse> {
    console.log('options', options)
    const params = Object.fromEntries(
      Object.entries(options).filter(([_, value]) =>
        value !== null && value !== undefined && value !== ''
      )
    );

    return this.http.get<EntidadResponse>(`${baseUrl}/entidad`, {
      params,
    }).pipe(
      tap((resp) => console.log('respEnti', resp)),
    );
  }

  // getEntidad(options: Options): Observable<EntidadResponse> {
  //   const { limit = 9, offset = 0 } = options;


  //   return this.http.get<EntidadResponse>(`${baseUrl}/entidad`, {
  //     params: {
  //       limit,
  //       offset,
  //     },
  //   }).pipe(
  //     tap((resp) => console.log('respEnti', resp)),
  //   );
  // }

  createEntidad(entidad: Partial<Entidad>) {
    console.log('entidad', entidad);
    return this.http.post<Entidad>(
      `${baseUrl}/entidad`,
      entidad
    );
  }

  updateEntidad(
    id: string,
    entidad: Partial<Entidad>
  ) {
    console.log('entidad', entidad);
    return this.http.patch<Entidad>(

      `${baseUrl}/entidad/${id}`,
      entidad
    );
  }




}
