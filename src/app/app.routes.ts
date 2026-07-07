import { Routes } from '@angular/router';
import { AuthenticatedGuard } from '@auth/guards/authenticated.guard';
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
    { path: 'main', loadChildren: () => import('./main/main.routes'),
         canMatch: [AuthenticatedGuard],
    },
    { path: 'users', loadChildren: () => import('./users/users.routes') },
    { path: 'organizacion', loadChildren: () => import('./modules/organizacion/org.routes') },
    { path: 'hojaRuta', loadChildren: () => import('./modules/hojaRuta/hojaRuta.routes') },
    { path: 'entidades', loadChildren: () => import('./modules/entidades/entidad.routes') },
    { path: '', loadChildren: () => import('./home/home.routes') },
];