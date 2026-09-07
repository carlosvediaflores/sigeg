import { User } from "@auth/interfaces/user.interface";
import { HrArchivado } from "../../hojaRuta/interfaces/hojaRuta";


export interface Org {
  _id: string;
  nombre: string;
  sigla: string;
  codigo?:number;
  cargo: string;
  persona?: User | string ;
  isActive?: boolean;
  unidadFuncional: UnidadFuncional[];
  hrArchivo: HrArchivado[];
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
  hrArchivo: HrArchivado[];
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
  hrArchivo: HrArchivado[];
}