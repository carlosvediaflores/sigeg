import { Routes } from "@angular/router";
import { UserLayout } from "./user-layout/user-layout";
import { ListUsers } from "./pages/list-users/list-users";
import { UserDashboard } from "./user-dashboard/user-dashboard";
import { IsAdminGuard } from "@auth/guards/is-admin.guard";
import { User } from "./user/user";
import { Permisos } from "./permisos/permisos";
import { Roles } from "./roles/roles";
import { PermisosList } from "./permisos/permisos-list/permisos-list";
import { RolesList } from "./roles/roles-list/roles-list";
import { UserDetalles } from "./user/user-detalles/user-detalles";

export const mainRoutes: Routes = [
  {
    path: '',
    component: UserLayout, canMatch: [IsAdminGuard],
    children: [
      { path: '', component: ListUsers, },
      {
        path: 'list',
        component: ListUsers,
      },

     {path: 'permisos-list', component: PermisosList, },

     {path: 'roles-list', component: RolesList, },

      {path: 'roles/:id', component: Roles, },

      { path: 'permisos/:id', component: Permisos, },

      {
        path: ':id',
        component: UserDetalles,
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

export default mainRoutes;