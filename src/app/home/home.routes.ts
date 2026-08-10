import { Routes } from "@angular/router";
import { HomeLayout } from "./home-layout/home-layout";
import { HomePage } from "./pages/home-page/home-page";
import { BuscarTramite } from "./pages/buscarTramite/buscarTramite";
import { Gaceta } from "./pages/gaceta/gaceta";
import { Historia } from "./pages/historia/historia";
import { MisionVision } from "./pages/misionVision/misionVision";
import { Alcalde } from "./pages/alcalde/alcalde";
import { ConcejoMunicipal } from "./pages/concejoMunicipal/concejoMunicipal";
import { Organigrama } from "./pages/organigrama/organigrama";

export const homeRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'miTramite',
        component: BuscarTramite,
      },
      {
        path: 'gaceta',
        component: Gaceta,
      },
       {
        path: 'historia',
        component: Historia,
      },
        {
        path: 'mision-vision',
        component: MisionVision,
      },
       {
        path: 'alcade',
        component: Alcalde,
      },
      {
        path: 'concejo-municipal',
        component: ConcejoMunicipal,
      },
      {
        path: 'organigrama',
        component: Organigrama,
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];

export default homeRoutes;