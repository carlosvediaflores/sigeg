import { Routes } from "@angular/router";
import { MainLayout } from "./main-layout/main-layout";
import { AppPage } from "./pages/app-page/app-page";

export const mainRoutes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'main',
        component: AppPage,
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

export default mainRoutes;