import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { inject } from '@angular/core/primitives/di';
import { HttpClient } from '@angular/common/http';
import { GacetaResponse, GacetaSimple, TipoGacetaInterface } from '../interfaces/gaceta.interface';
import { Observable, tap } from 'rxjs';

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class GacetaService {
  private http = inject(HttpClient);

  private gacetasCache = new Map<string, GacetaResponse>();
  private gacetaCache = new Map<string, GacetaSimple>();

  clearCache() {
    this.gacetaCache.clear();
    this.gacetasCache.clear();
  }

  getGacetas(options: Options): Observable<GacetaResponse> {
    console.log('optionsSegui', options)
    const params = Object.fromEntries(
      Object.entries(options).filter(([_, value]) =>
        value !== null && value !== undefined && value !== ''
      )
    );
    return this.http.get<GacetaResponse>(`${baseUrl}/gaceta`, { params }).pipe(
    );
  }


  createGaceta(data: FormData) {
    return this.http.post(
      `${baseUrl}/gaceta`,
      data
    );
  }

  updateGaceta(id: string, data: FormData) {
    return this.http.patch(`${baseUrl}/gaceta/${id}`, data);
  }

  deleteGaceta(id: string) {
    return this.http.delete(`${baseUrl}/gaceta/${id}`);
  }

  gettipoGaceta(): Observable<TipoGacetaInterface[]> {
    return this.http.get<TipoGacetaInterface[]>(`${baseUrl}/gaceta/tipo/all`);
  }

  

  createTipoGaceta(tipoGaceta: Partial<TipoGacetaInterface>) {
    return this.http.post<TipoGacetaInterface>(`${baseUrl}/gaceta/tipo`, tipoGaceta);
  }

  updateTipoGaceta(id: string, tipoGaceta: Partial<TipoGacetaInterface>) {
    return this.http.patch<TipoGacetaInterface>(`${baseUrl}/gaceta/tipo/${id}`, tipoGaceta);
  }

  deleteTipoGaceta(id: string) {
    return this.http.delete(`${baseUrl}/gaceta/tipo/${id}`);
  }
  printConfirmacion(id: string) {
    return this.http.get(`${baseUrl}/gaceta/printConfir/${id}`, { responseType: 'blob' });
  }
}
