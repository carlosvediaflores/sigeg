import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from '@auth/guards/not-authenticated.guard';

export const routes: Routes = [
    {
        path: 'auth', loadChildren: () => import('./auth/auth.routes'),
        canMatch: [
            () => {
              console.log('hola Mundo');
              return true;
            },
            NotAuthenticatedGuard,
        ],
    },
    { path: 'main', loadChildren: () => import('./main/main.routes') },
    { path: 'users', loadChildren: () => import('./users/users.routes') },
    { path: '', loadChildren: () => import('./home/home.routes') },
];