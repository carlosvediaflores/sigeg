import { Routes } from "@angular/router";
import { MainLayout } from "./main-layout/main-layout";
import { AppPage } from "./pages/app-page/app-page";

export const mainRoutes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: AppPage,
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];

export default mainRoutes;