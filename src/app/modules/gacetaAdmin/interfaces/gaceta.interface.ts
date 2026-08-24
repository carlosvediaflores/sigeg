export interface TipoGacetaInterface {
  _id: string;
  nombre: string;
  description: string;
}

export interface GacetaSimple {
  _id: string;
  numero: number;
  gestion: number;
  titulo: string;
  fechaPublicacion: string;
  fechaAprobacion: string;
  nombreTipo: string;
  tipo: TipoGacetaInterface;

  archivo?: string;
  nombreArchivoOriginal?: string;
  mimeType?: string;
  tamano?: number;
  extension?: string;
  fechaSubidaArchivo?: string;

  isActive: boolean;
  isPublic: boolean;
}

export interface GacetaResponse {
  total: number;
  pages: number;
  gacetas: GacetaSimple[];
}