import { Org, SubUnidad, UnidadFuncional } from "../../modules/organizacion/interfaces/org.interface";

export interface User {
  _id: string;
  email: string;
  nombre: string;
  apellidos: string;
  ci: string;
  fechaNac: Date;
  direccion: string;
  telefono: string;
  password?: string;
  foto?: string;
  isActive: boolean;
  idUnidadOrg?:Org | string;
  idUnidadFuncional?: UnidadFuncional | string;
  idSubUnidad?:SubUnidad | string;
  roles: Roles[];
}

export interface Roles {
  _id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  _id: string;
  name: string;
}