import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Representante, RepresentanteResponse } from '../interfaces/representante.interface';
import { Observable, tap } from 'rxjs';
const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class RepresentanteService {
  private http = inject(HttpClient);

  getRepresentante(options: OptionsRepresentante): Observable<RepresentanteResponse> {
    const params = Object.fromEntries(
      Object.entries(options).filter(([_, value]) =>
        value !== null && value !== undefined && value !== ''
      )
    );

    return this.http.get<RepresentanteResponse>(`${baseUrl}/entidad/representante/query`, { params }).pipe(
          tap((resp) => console.log('respRep', resp)),
        );;
  }

  createRepresentante(representante: Partial<Representante>) {
    console.log('representante', representante);
    return this.http.post<Representante>(
      `${baseUrl}/entidad/representante`,
      representante
    );
  }

  updateRepresentante(
    id: string,
    representante: Partial<Representante>
  ) {
    console.log('representante', representante);
    return this.http.patch<Representante>(
      `${baseUrl}/entidad/representante/${id}`,
      representante
    );
  }
}

