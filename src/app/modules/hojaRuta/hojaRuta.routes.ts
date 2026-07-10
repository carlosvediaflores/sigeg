import { Routes } from "@angular/router";
import { HojaRutaLayout } from "./hoja-ruta-layout/hoja-ruta-layout";
import { IsAdminGuard } from "@auth/guards/is-admin.guard";
import { Dasboard } from "./dasboard/dasboard";
import { HojaRuta } from "./pages/hoja-ruta/hoja-ruta";
import { NewSeguimiento } from "./pages/new-seguimiento/new-seguimiento";
import { Oficina } from "./pages/oficina/oficina";

export const hojaRutaRoutes: Routes = [
  {
    path: '',
    component: HojaRutaLayout, canMatch: [IsAdminGuard],
    children: [
      {
        path: 'list',
        component: HojaRuta,
      },
      { path: '', component: HojaRuta, },

     {path: 'oficina', component: Oficina, },

    /*  {path: 'roles-list', component: RolesList, }, */

      {path: 'enviar/:id/:idSeg', component: NewSeguimiento, },

      /* { path: 'permisos/:id', component: Permisos, }, */

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