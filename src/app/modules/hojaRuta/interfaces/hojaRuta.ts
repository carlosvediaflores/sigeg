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
}

export interface HojaRutaSimple {
    _id: string;
    origen: string;
    idOrigen: string;
    tipoOrigen: string;
    tipoDocumento: string;
    prioridad: string;
    beneficiarioPago: string;
    contactoOrigrn: string;
    referencia: string;
    estado: string;
    fechaDocumento: Date | string;
    fechaRecepcion: Date | string;
    numero: number;
    gestion: number;
    seguimientos: Seguimiento[];
    asociados: Asociados[];
    archivos: Archivos[];
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
    smsMaletin: string;
    fechaDerivado: Date | string;
    fechaRecepcion: Date | string;
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
    archivosOficina: ArchivosOficina[];
    carpetasOficina: CarpetasOficina[];

}

export interface Asociados {

}

export interface Archivos {

}

export interface ArchivosOficina {

}

export interface CarpetasOficina {

}

