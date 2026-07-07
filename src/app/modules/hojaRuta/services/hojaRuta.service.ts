import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { HojaRutaSimple, HojaRutaResponse } from '../interfaces/hojaRuta';
import { HttpClient } from '@angular/common/http';
const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class HojaRutaService {

  private http = inject(HttpClient);



  private hojaRutasCache = new Map<string, HojaRutaResponse>();
  private hojaRutaCache = new Map<string, HojaRutaSimple>();

  clearCache() {
    this.hojaRutaCache.clear();
    this.hojaRutasCache.clear();
  }

  getHojaRutas(options: Options): Observable<HojaRutaResponse> {
    const { limit = 9, offset = 0 } = options;

    const key = `${limit}-${offset}`; // 9-0-''
    if (this.hojaRutasCache.has(key)) {
      return of(this.hojaRutasCache.get(key)!);
    }

    return this.http
      .get<HojaRutaResponse>(`${baseUrl}/hojarutas`, {
        params: {
          limit,
          offset,
        },
      })
      .pipe(
       // tap((resp) => console.log('resp', resp)),
        tap((resp) => this.hojaRutasCache.set(key, resp))
      );
  }
  getHojaRuta(id: string): Observable<HojaRutaSimple> {
    if (this.hojaRutaCache.has(id)) {
      return of(this.hojaRutaCache.get(id)!);
    }

    return this.http
      .get<HojaRutaSimple>(`${baseUrl}/hojarutas/${id}`)
      .pipe(
        tap((resp) => console.log('respHR', resp)),
        tap((resp) => this.hojaRutaCache.set(id, resp))
      );
  }
  getHojaRutaByIdOrigen(id: string): Observable<HojaRutaSimple> {
    return this.http.get<HojaRutaSimple>(
      `${baseUrl}/hojarutas/${id}`
    );
  }
  createHojaRuta(hojaRuta: Partial<HojaRutaSimple>) {
    return this.http.post<HojaRutaSimple>(`${baseUrl}/hojarutas`, hojaRuta)
      .pipe(
        tap(hr => {
          this.hojaRutaCache.set(hr._id, hr);
          this.hojaRutasCache.clear();
        })
      )
  }

  updateHojaRuta(
    id: string,
    hojaRuta: Partial<HojaRutaSimple>
  ) {
    return this.http.patch<HojaRutaSimple>(
      `${baseUrl}/hojarutas/${id}`,
      hojaRuta
    )
      .pipe(
        tap(hr => {
          this.hojaRutaCache.set(hr._id, hr);
          this.hojaRutasCache.clear();
        })
      );
  }

  printHojaRuta(id: string) {
    return this.http.get(`${baseUrl}/hojarutas/printHR/${id}`, {
      responseType: 'blob',
    });
  }
}
