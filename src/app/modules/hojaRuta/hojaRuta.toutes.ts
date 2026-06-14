import { Routes } from "@angular/router";
import { HojaRutaLayout } from "./hoja-ruta-layout/hoja-ruta-layout";
import { IsAdminGuard } from "@auth/guards/is-admin.guard";
import { Dasboard } from "./dasboard/dasboard";
import { HojaRuta } from "./pages/hoja-ruta/hoja-ruta";

export const hojaRutaRoutes: Routes = [
  {
    path: '',
    component: HojaRutaLayout, canMatch: [IsAdminGuard],
    children: [
      {
        path: '',
        component: HojaRuta,
      },
      { path: '', component: Dasboard, },

     /* {path: 'permisos-list', component: PermisosList, },

     {path: 'roles-list', component: RolesList, },

      {path: 'roles/:id', component: Roles, },

      { path: 'permisos/:id', component: Permisos, },
 */
     /*  {
        path: ':id',
        component: OrgNew,
      }, */
      //   {
      //     path: 'product/:idSlug',
      //     component: ProductPage  ,
      //   },

      //   {
      //     path: '**',
      //     component: NotFountPage,
      //   },
    ],
  },
];

export default hojaRutaRoutes;