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
    { path: 'users', loadChildren: () => import('./users/users.routes'), canMatch: [AuthenticatedGuard] },
    { path: 'organizacion', loadChildren: () => import('./modules/organizacion/org.routes'), canMatch: [AuthenticatedGuard] },
    { path: 'hojaRuta', loadChildren: () => import('./modules/hojaRuta/hojaRuta.routes'), canMatch: [AuthenticatedGuard] },
    { path: 'entidades', loadChildren: () => import('./modules/entidades/entidad.routes'), canMatch: [AuthenticatedGuard] },
    { path: '', loadChildren: () => import('./home/home.routes') },
];