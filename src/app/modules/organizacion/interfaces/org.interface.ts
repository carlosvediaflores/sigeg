import { User } from "@auth/interfaces/user.interface";


export interface Org {
  _id: string;
  nombre: string;
  sigla: string;
  codigo?:number;
  cargo: string;
  persona?: User | string ;
  isActive?: boolean;
  unidadFuncional: UnidadFuncional[];
}

export interface UnidadFuncional {
  _id: string;
  nombre: string;
  sigla: string;
  codigo?:number;
  cargo: string;
  persona?: User | string;
  idUnidadOrg : Org['_id'];
  subUnidad?: SubUnidad[];
  isActive?: boolean;
}

export interface SubUnidad {
  _id: string;
  nombre: string;
  sigla: string;
  codigo?:number;
  cargo: string;
  persona?:  User | string;
  unidadFuncional : UnidadFuncional['_id'];
  isActive?: boolean;
}