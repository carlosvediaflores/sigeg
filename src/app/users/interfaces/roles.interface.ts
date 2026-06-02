import { Permiso } from "./permisos.interface";

export interface Role {
    _id: string;
    name: string;
    description: string;
    permissions: Permiso[];
}