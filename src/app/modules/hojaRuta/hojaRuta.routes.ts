import { Routes } from "@angular/router";
import { HojaRutaLayout } from "./hoja-ruta-layout/hoja-ruta-layout";
import { IsAdminGuard } from "@auth/guards/is-admin.guard";
import { Dasboard } from "./dasboard/dasboard";
import { HojaRuta } from "./pages/hoja-ruta/hoja-ruta";
import { NewSeguimiento } from "./pages/new-seguimiento/new-seguimiento";
import { Oficina } from "./pages/oficina/oficina";
import { Archivados } from "./pages/archivados/archivados";
import { ReportsHR } from "./pages/reportsHR/reportsHR";

export const hojaRutaRoutes: Routes = [
  {
    path: '',
    component: HojaRutaLayout,
    children: [
      { path: '', component: Dasboard, },
      {
        path: 'list',
        component: HojaRuta,
      },

     {path: 'oficina', component: Oficina, },

     {path: 'archivados', component: Archivados, },

     {path: 'report-hoja-ruta', component: ReportsHR, },

     /*  {path: 'enviar/:id', component: NewSeguimiento, }, */
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