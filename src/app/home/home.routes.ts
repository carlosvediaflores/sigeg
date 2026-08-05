import { Routes } from "@angular/router";
import { HomeLayout } from "./home-layout/home-layout";
import { HomePage } from "./pages/home-page/home-page";
import { BuscarTramite } from "./pages/buscarTramite/buscarTramite";

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

    //   {
    //     path: 'gender/:gender',
    //     component: GenderPage,
    //   },
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

  {
    path: '**',
    redirectTo: '',
  },
];

export default homeRoutes;