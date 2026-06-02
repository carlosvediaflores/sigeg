import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User, } from '@auth/interfaces/user.interface';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { UsersResponse } from '../interfaces/user.interface';

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
}

const emptyUser: User = {
  _id: 'new',
  nombre: '',
  apellidos: '',
  ci: '',
  fechaNac: new Date(),
  direccion: '',
  telefono: '',
  email: '',
  password: '',
  foto: '',
  isActive: true,
  idCargo: '',
  roles: [],
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);


  private usersCache = new Map<string, UsersResponse>();
  private userCache = new Map<string, User>();

  getUsers(options: Options): Observable<UsersResponse> {
    const { limit = 9, offset = 0 } = options;

    const key = `${limit}-${offset}`; // 9-0-''
    if (this.usersCache.has(key)) {
      return of(this.usersCache.get(key)!);
    }

    return this.http
      .get<UsersResponse>(`${baseUrl}/users`, {
        params: {
          limit,
          offset,
        },
      })
      .pipe(
        tap((resp) => console.log('resp', resp)),
        tap((resp) => this.usersCache.set(key, resp))
      );
  }

  getUserById(id: string): Observable<User> {
    if (id === 'new') {
      return of(emptyUser);
    }

    if (this.userCache.has(id)) {
      return of(this.userCache.get(id)!);
    }

    return this.http
      .get<User>(`${baseUrl}/users/${id}`)
      .pipe(tap((user) => this.userCache.set(id, user)));
  }

  createUser(
    userLike: Partial<User>
  ): Observable<User> {
    return this.http
      .post<User>(`${baseUrl}/users`, userLike)
      .pipe(tap((user) => this.updateUserCache(user)));
  }

  updateUser(
    id: string,
    userLike: Partial<User>
  ): Observable<User> {
    return this.http
      .patch<User>(`${baseUrl}/users/${id}`, userLike)
      .pipe(tap((user) => this.updateUserCache(user)));
  }

  updateProduct(
    id: string,
    updatedUser: Partial<User>,
  ): Observable<User> {
    return this.http
      .patch<User>(`${baseUrl}/users/${id}`, updatedUser)
      .pipe(tap((user) => this.updateUserCache(user)));

    // return this.http
    //   .patch<Product>(`${baseUrl}/products/${id}`, productLike)
    //   .pipe(tap((product) => this.updateProductCache(product)));
  }

  updateUserCache(user: User) {
    const userId = user._id;

    this.userCache.set(userId, user);

    this.usersCache.forEach((userResponse) => {
      userResponse.users = userResponse.users.map(
        (currentUser) =>
          currentUser._id === userId ? user : currentUser
      );
    });

    console.log('Caché actualizado');
  }

}
