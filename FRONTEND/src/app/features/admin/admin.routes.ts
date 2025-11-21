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
                path: 'medico-permiso',
                loadComponent: () =>
                            import('./components/permiso/medico-permiso/medico-permiso.component').then(
                                m => m.MedicoPermisoComponent
                            ),
            },
            {
                path: 'recepcionista-permiso',
                loadComponent: () =>
                            import('./components/permiso/recepcionista-permiso/recepcionista-permiso.component').then(
                                m => m.RecepcionistaPermisoComponent
                            ),
            },
            { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
            ,{
                path: 'abmc-permiso',
                loadComponent: () =>
                            import('./components/permiso/abmc-permiso/abmc-permiso.component').then(
                                m => m.ABMCPermisoComponent
                            ),
            },
            { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
        ]
    }
];