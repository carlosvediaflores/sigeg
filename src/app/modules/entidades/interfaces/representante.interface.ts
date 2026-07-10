import { Entidad } from "./entidad.interface";

export interface RepresentanteResponse {
  total: number;
  pages: number;
  representantes: Representante[];
}

export interface Representante {
  _id: string;
  email: string;
  nombre: string;
  apellidos: string;
  ci: string;
  direccion: string;
  telefono: string;
  cargo?: string;
  isActive: boolean;
  idEntidad?:Entidad;
  
}
