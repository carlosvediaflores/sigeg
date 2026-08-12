export interface HeroSlide {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  imagen: string;
  botonTexto: string;
  botonRuta: string;
}

export interface DocumentoGaceta {

  id: number;

  numero: string;

  tipo: string;

  titulo: string;

  fecha: string;

  gestion: number;

  archivo: string;

  fechaAprobacion: string; // NUEVO

}
