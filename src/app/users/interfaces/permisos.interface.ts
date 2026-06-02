export interface PermisosResponse {
  total: number;
  pages: number;
  permissions: Permiso[];
}

export interface Permiso{
    _id: string;
    name: string;
    description: string;
    method: string;
    urn: string;

}