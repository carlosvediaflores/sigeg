import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from '@auth/guards/not-authenticated.guard';

export const routes: Routes = [
    {
        path: 'auth', loadChildren: () => import('./auth/auth.routes'),
        canMatch: [
            () => {
                return true;
            },
            NotAuthenticatedGuard,
        ],
    },
    { path: 'main', loadChildren: () => import('./main/main.routes')},
    { path: 'users', loadChildren: () => import('./users/users.routes') },
    { path: 'organizacion', loadChildren: () => import('./modules/organizacion/org.routes') },
    { path: 'hojaRuta', loadChildren: () => import('./modules/hojaRuta/hojaRuta.toutes') },
    { path: '', loadChildren: () => import('./home/home.routes') },
];