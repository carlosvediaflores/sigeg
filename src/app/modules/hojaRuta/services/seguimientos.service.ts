import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SeguimientosResponse, Seguimiento, HojaRutaSimple } from '../interfaces/hojaRuta';
import { Observable, of, tap } from 'rxjs';
const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
}
@Injectable({
  providedIn: 'root',
})
export class SeguimientosService {
  private http = inject(HttpClient);

  private seguimientosCache = new Map<string, SeguimientosResponse>();
  private seguimientoCache = new Map<string, Seguimiento>();

  getSeguimientos(options: Options): Observable<SeguimientosResponse> {
        console.log('optionsSegui', options)
        const params = Object.fromEntries(
          Object.entries(options).filter(([_, value]) =>
            value !== null && value !== undefined && value !== ''
          )
        );
    
        return this.http.get<SeguimientosResponse>(`${baseUrl}/seguimientos`, {
          params,
          
        }).pipe(
          tap((resp) => console.log('PARAMS', params)),
          tap((resp) => console.log('Segui', resp)),
        );
      }
 /*  getSeguimientos(options: Options): Observable<SeguimientosResponse> {
    const { limit = 9, offset = 0 } = options;

    const key = `${limit}-${offset}`; // 9-0-''
    if (this.seguimientosCache.has(key)) {
      return of(this.seguimientosCache.get(key)!);
    }

    return this.http
      .get<SeguimientosResponse>(`${baseUrl}/seguimientos`, {
        params: {
          limit,
          offset,
        },
      })
      .pipe(
        tap((resp) => console.log('respSegui', resp)),
        tap((resp) => this.seguimientosCache.set(key, resp))
      );
  } */
  createSeguimiento(seguimiento: Partial<Seguimiento>) {
    console.log('createSeguimiento', seguimiento);
    return this.http.post<Seguimiento>(`${baseUrl}/seguimientos`, seguimiento)
      .pipe(
        tap(segui => {
          this.seguimientoCache.set(segui._id, segui);
          this.seguimientosCache.clear();
        })
      )
  }

  updateSeguimiento(
    id: string,
    segui: Partial<Seguimiento>
  ) {
    console.log('createSeguimiento', segui);
    return this.http.patch<Seguimiento>(
      `${baseUrl}/seguimientos/${id}`,
      segui
    )
      .pipe(
        tap(seguim => {
          this.seguimientoCache.set(seguim._id, seguim);
          this.seguimientosCache.clear();
        })
      );
  }

  getSegui(id: string): Observable<Seguimiento> {
  
    return this.http
      .get<Seguimiento>(`${baseUrl}/seguimientos/${id}`)
      .pipe(
        tap((resp) => console.log('respSegui', resp)),
    
      );
  }

  anularEnvio(id: string) {
    console.log('Anular envío de Hoja de Ruta', id);
    return this.http.patch(
      `${environment.baseUrl}/seguimientos/${id}/anular-envio`,
      {}
    );
  }

}
