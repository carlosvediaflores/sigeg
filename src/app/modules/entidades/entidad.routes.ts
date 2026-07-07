import { Routes } from "@angular/router";
import { EntidadesLayout } from "./entidades-layout/entidades-layout";
import { IsAdminGuard } from "@auth/guards/is-admin.guard";
import { EntidadList } from "./pages/entidad-list/entidad-list";
import { EntidadSelec } from "./pages/entidad-selec/entidad-selec";
import { Representantes } from "./pages/representantes/representantes";


export const entidadRoutes: Routes = [
  {
    path: '',
    component: EntidadesLayout, canMatch: [IsAdminGuard],
    children: [
      {
        path: '',
        component: EntidadList,
      },
   

    

     {path: 'select', component: EntidadSelec, },

    

      { path: 'representantes', component: Representantes, },

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

export default entidadRoutes;