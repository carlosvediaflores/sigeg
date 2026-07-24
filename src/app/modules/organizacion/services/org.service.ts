import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SubUnidad, Org, UnidadFuncional } from '../interfaces/org.interface';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

const baseUrl = environment.baseUrl;

const emptyOrg: Org = {
  _id: 'new',
  nombre: '',
  sigla: '',
  codigo: 0,
  cargo: '',
  persona: '',
  isActive: true,
  unidadFuncional: []
};

const emptyUni: UnidadFuncional = {
  _id: 'new',
  nombre: '',
  sigla: '',
  codigo: 0,
  cargo: '',
  persona:'',
  isActive: true,
  idUnidadOrg: '',
  subUnidad: [],
};

const emptyCargo: SubUnidad = {
  _id: 'new',
  nombre: '',
  sigla: '',
  codigo: 0,
  cargo: '',
  persona:'',
  isActive: true,
  unidadFuncional: '',
};

@Injectable({
  providedIn: 'root',
})
export class OrgService {

   private http = inject(HttpClient);
  getOrgs() {
    return this.http.get<Org[]>(`${baseUrl}/cargo/uni-org/all/get`)
    //.pipe(tap((resp) => console.log('orgs', resp)));
  }

  getOrgById(id: string) {
    if (id === 'new') {
      return emptyOrg;
    }
    return this.http.get<Org>(`${baseUrl}/cargo/uni-org/${id}`);
  }

  createOrg(org: Partial<Org>) {
    return this.http.post<Org>(
      `${baseUrl}/cargo/uni-org`,
      org
    );
  }

  updateOrg(
    id: string,
    org: Partial<Org>
  ) {
    return this.http.patch<Org>(
      `${baseUrl}/cargo/uni-org/${id}`,
      org
    );
  }

  deleteOrg(id: string) {
    return this.http.delete(`${baseUrl}/cargo/uni-org/${id}`);
  }

  createUnidadFuncional(uni: Partial<UnidadFuncional>) {
    return this.http.post<UnidadFuncional>(
      `${baseUrl}/cargo/uni-fun`,
      uni
    );
  }

  updateUnidadFuncional(
    id: string,
    uni: Partial<UnidadFuncional>
  ) {
    return this.http.patch<UnidadFuncional>(
      `${baseUrl}/cargo/uni-fun/${id}`,
      uni
    );
  }

  deleteUnidadFuncional(id: string) {
    return this.http.delete(`${baseUrl}/cargo/uni-fun/${id}`);
  }

  createCargo(cargo: Partial<SubUnidad>) {
    return this.http.post<SubUnidad>(
      `${baseUrl}/cargo`,
      cargo
    );
  }

  updateCargo(
    id: string,
    cargo: Partial<SubUnidad>
  ) {
    return this.http.patch<SubUnidad>(
      `${baseUrl}/cargo/${id}`,
      cargo
    );
  }

  deleteCargo(id: string) {
    return this.http.delete(`${baseUrl}/cargo/${id}`);
  }


}
