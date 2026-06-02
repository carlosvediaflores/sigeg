import { inject, Injectable } from '@angular/core';
import { Role } from '../interfaces/roles.interface';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { of, tap } from 'rxjs';

const baseUrl = environment.baseUrl;
const emptyRole: Role = {
  _id: 'new',
  name: '',
  description: '',
  permissions: []
};

@Injectable({
  providedIn: 'root',
})
export class RolesService {

  private http = inject(HttpClient);
  getRoles() {
    return this.http.get<Role[]>(`${baseUrl}/roles`)
      //.pipe(tap((resp) => console.log('roles', resp)));
  }

  getRoleById(id: string) {
    if (id === 'new') {
      return of(emptyRole);
    }
    return this.http.get<Role>(`${baseUrl}/roles/${id}`);
  }

  createRole(role: Partial<Role>) {
    return this.http.post<Role>(
      `${baseUrl}/roles`,
      role
    );
  }

  updateRole(
    id: string,
    role: Partial<Role>
  ) {
    return this.http.patch<Role>(
      `${baseUrl}/roles/${id}`,
      role
    );
  }

}
