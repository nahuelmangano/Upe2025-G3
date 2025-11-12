import { Routes } from '@angular/router';
import { APP_ROLES } from '@core/constants/roles.constants';
import { RoleGuard } from '@core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: 'admin',
        canMatch: [RoleGuard],
        data: { role: APP_ROLES.ADMIN },
        loadComponent: () =>
            import('../admin/components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            {
                path: 'usuarios',
                loadComponent: () =>
                    import('./components/usuario/usuario.component').then(
                        m => m.UsuarioComponent
                    )
            },
            {
                path: 'permisos',
                loadComponent: () =>
                    import('./components/permiso/permiso.component').then(
                        m => m.PermisoComponent
                    )
            },
            { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
        ]
    }
];