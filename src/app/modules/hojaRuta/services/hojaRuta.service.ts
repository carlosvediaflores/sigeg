import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { HojaRuta, HojaRutaResponse } from '../interfaces/hojaRuta';
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


  private hojaRutaCache = new Map<string, HojaRutaResponse>();
  private userCache = new Map<string, HojaRuta>();

  getHojaRutas(options: Options): Observable<HojaRutaResponse> {
      const { limit = 9, offset = 0 } = options;
  
      const key = `${limit}-${offset}`; // 9-0-''
      if (this.hojaRutaCache.has(key)) {
        return of(this.hojaRutaCache.get(key)!);
      }
      
      return this.http
        .get<HojaRutaResponse>(`${baseUrl}/hojarutas`, {
          params: {
            limit,
            offset,
          },
        })
        .pipe(
          tap((resp) => console.log('resp', resp)),
          tap((resp) => this.hojaRutaCache.set(key, resp))
        );
    }
  createHojaRuta(hojaRuta: Partial<HojaRuta>) {
      return this.http.post<HojaRuta>(
        `${baseUrl}/hojarutas`,
        hojaRuta
      );
    }
  
    updateHojaRuta(
      id: string,
      hojaRuta: Partial<HojaRuta>
    ) {
      return this.http.patch<HojaRuta>(
        `${baseUrl}/hojarutas/${id}`,
        hojaRuta
      );
    }
}
