import { Routes } from "@angular/router";
import { GacetaPage } from "./pages/gacetaPage/gacetaPage";
import { GacetaLayout } from "./gaceta-layout/gaceta-layout";
import { GacetaReports } from "./pages/gacetaReports/gacetaReports";
import { TipoGaceta } from "./pages/tipoGaceta/tipoGaceta";


export const gacetaRoutes: Routes = [
  {
    path: '',
    component: GacetaLayout,
    children: [
      { path: '', component: GacetaPage, },
      {
        path: 'tipo-gaceta',
        component: TipoGaceta,
      },
      {
        path: 'reports',
        component: GacetaReports,
      },

    ],
  },
];

export default gacetaRoutes;