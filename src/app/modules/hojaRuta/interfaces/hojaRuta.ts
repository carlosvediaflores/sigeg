export interface HojaRutaResponse{
    total: number;
      pages: number;
      hojaRutas: HojaRuta[];
}

export interface HojaRuta{
     _id: string;
    origen: string;
    idOrigen: string;
    tipoOrigen: string;
    tipoDocumento: string;
    prioridad: string;
    beneficiarioPago: string;
    contactoOrigrn: string;
    referencia: string;
    estado:string;
    fechaDocumento:Date | string;
    fechaRecepcion:Date | string;
    numero:number;
    gestion:number;
    seguimientos:Seguimientos[];
    asociados:Asociados[];
    archivos:Archivos[];
    isActive:Boolean;

}

export interface Seguimientos{

}

export interface Asociados{

}

export interface Archivos{

}

