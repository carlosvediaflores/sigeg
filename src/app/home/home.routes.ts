import { Routes } from "@angular/router";
import { HomeLayout } from "./home-layout/home-layout";
import { HomePage } from "./pages/home-page/home-page";

export const homeRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      {
        path: '',
        component: HomePage,
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