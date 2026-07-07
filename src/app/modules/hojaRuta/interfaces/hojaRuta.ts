import { User } from "@auth/interfaces/user.interface";
import { Org, SubUnidad, UnidadFuncional } from "../../organizacion/interfaces/org.interface";

export interface HojaRutaResponse {
    total: number;
    pages: number;
    hojaRutas: HojaRutaSimple[];
}

export interface SeguimientosResponse {
    total: number;
    pages: number;
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

}

export interface Seguimiento {
    _id: string;
    origenHr: string;
    numeroHr: number;
    idHojaRuta: HojaRutaSimple | string;
    tipoEnvio: string;
    detalle: string;
    estado: string;
    smsMaletin: string;
    fechaDerivado: Date | string;
    fechaRecepcion: Date | string;
    numeroCopia: number;
    gestion: number;
    idUnidadOrgOrigen?: Org ;
    idUnidadFuncOrigen?:UnidadFuncional;
    idSubUnidadOrigen?: SubUnidad ;
    idUnidadOrgDest?: Org ;
    idUnidadFuncDest?: UnidadFuncional ;
    idSubUnidadDest?: SubUnidad ;
    origenUser: User;
    destinoUser:  User;
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

