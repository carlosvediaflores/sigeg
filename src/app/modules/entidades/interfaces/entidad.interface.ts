import { Representante } from "./representante.interface";

export interface EntidadResponse {
  total: number;
  pages: number;
  entidades: Entidad[];
}

export interface Entidad{
    _id: string;
    nit: number;
    cuenta: number;
    denominacion: string;
    codigo: string;
    sigla: string;
    telefono: string;
    tipoEntidad: string;
    isActive: boolean;
    estado: boolean;
    representante:Representante;
}