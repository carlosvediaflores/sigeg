interface Options {
  limit?: number;
  offset?: number;
  termino?: string | null;
  tipoEntidad?: string | null;
  estado?: string | boolean | null;
}

interface OptionsRepresentante {
  limit?: number;
  offset?: number;
  termino?: string | null;
  isActive?: string | boolean | null;
}