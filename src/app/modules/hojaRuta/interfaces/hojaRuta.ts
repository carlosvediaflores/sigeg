import { User } from "@auth/interfaces/user.interface";
import { Org, SubUnidad, UnidadFuncional } from "../../organizacion/interfaces/org.interface";
import { Entidad } from "../../entidades/interfaces/entidad.interface";

export interface HojaRutaResponse {
    total: number;
    pages: number;
    totalAnulado: number;
    totalEnviado: number
    totalFinalizado: number
    totalRecibido: number
    totalRegistrado: number
    hojaRutas: HojaRutaSimple[];
}

export interface SeguimientosResponse {
    total: number;
    pages: number;
    totalArchivados: number;
    totalEnviados: number
    totalFinalizados: number
    totalRecibidos: number
    totalDerivados: number
    seguimientos: Seguimiento[];
    pendientesRecepcion: Seguimiento[];
    totalPendientesRecepcion: number;
}

export interface HojaRutaSimple {
    _id: string;
    origen: string;
    idOrigen: User | string;
    tipoOrigen: string;
    tipoDocumento: string;
    prioridad: string;
    beneficiarioPago: string;
    contactoOrigen: string;
    referencia: string;
    estado: string;
    fechaDocumento: Date | string;
    fechaRecepcion: Date;
    numero: number;
    gestion: number;
    seguimientos: Seguimiento[];
    asociados: Asociados[];
    isActive: Boolean;
    entidad: string;
    representante: string;
    cite: string;

}

export interface Seguimiento {
    _id: string;
    origenHr: string;
    numeroHr: number;
    idHojaRuta: HojaRutaSimple;
    tipoEnvio: string;
    detalle: string;
    estado: string;
    smsArchivado: string;
    detalleArchivado: string;
    fechaDerivado: Date | string;
    fechaRecepcion: Date | string;
    fechaRespuesta: Date | string;  
    numeroCopia: number;
    gestion: number;
    idUnidadOrgOrigen?: Org;
    idUnidadFuncOrigen?: UnidadFuncional;
    idSubUnidadOrigen?: SubUnidad;
    idUnidadOrgDest?: Org;
    idUnidadFuncDest?: UnidadFuncional;
    idSubUnidadDest?: SubUnidad;
    origenUser: User;
    destinoUser: User;
    isActive: Boolean;

}

export interface Asociados {

}

export interface HrArchivado {
  _id: string;
  nombre: string;
  descripcion?: string;
  idUnidadOrg?: string;
  idUnidadFuncional?: string;
  idSubUnidad?: string;
  archivados: string[];
}

export interface ArchivadosResponse {
  total: number;
  pages: number;
  archivados: HrArchivado[];
}
export interface ArchivosOficina {

}

export interface CarpetasOficina {

}
export interface QueryHojaRutaDto {

    limit?: number;
    offset?: number;

    gestion?: number;

    numero?: string;

    termino?: string;

    estado?: string;

    tipoOrigen?: string;

    prioridad?: string;

    tipoDocumento?: string;

}
