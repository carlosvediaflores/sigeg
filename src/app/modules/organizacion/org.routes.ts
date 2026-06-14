import { Routes } from "@angular/router";
import { OrgLayout } from "./org-layout/org-layout";
import { IsAdminGuard } from "@auth/guards/is-admin.guard";
import { OrgList } from "./pages/org-list/org-list";
import { OrgNew } from "./pages/org-new/org-new";


export const orgRoutes: Routes = [
  {
    path: '',
    component: OrgLayout, canMatch: [IsAdminGuard],
    children: [
      { path: '', component: OrgList, },
      {
        path: 'list',
        component: OrgList,
      },

     /* {path: 'permisos-list', component: PermisosList, },

     {path: 'roles-list', component: RolesList, },

      {path: 'roles/:id', component: Roles, },

      { path: 'permisos/:id', component: Permisos, },
 */
      {
        path: ':id',
        component: OrgNew,
      },
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

export default orgRoutes;