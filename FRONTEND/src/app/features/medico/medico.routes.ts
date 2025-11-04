import { Routes } from '@angular/router';
import { PacienteContextGuard } from './guards/paciente-context.guard';
import { RoleGuard } from '@core/guards/role.guard';
import { APP_ROLES } from '@core/constants/roles.constants';

export const MEDICO_ROUTES: Routes = [
    {
        path: 'medico',
        canMatch: [RoleGuard],
        data: { role: APP_ROLES.MEDICO },
        loadComponent: () =>
            import('../medico/components/medico-layout/medico-layout.component').then(m => m.MedicoLayoutComponent),
        children: [
            {
                path: 'pacientes',
                canMatch: [PacienteContextGuard],
                loadComponent: () =>
                    import('./components/lista-pacientes-medico/lista-pacientes-medico').then(
                        m => m.ListaPacientesMedicoComponent
                    )
            },
            {
                path: 'paciente/:id/resumen',
                loadComponent: () =>
                    import('./components/resumen-paciente/resumen-paciente.component').then(
                        m => m.ResumenPacienteComponent
                    )
            },
            {
                path: 'paciente/:id/problemas',
                loadComponent: () =>
                    import('./components/problema/crear-problema/problema-form.component').then(
                        m => m.ProblemaFormComponent
                    )
            },
            {
                path: 'paciente/:id/problemas/nuevo',
                loadComponent: () =>
                    import('./components/problema/crear-problema/problema-form.component').then(
                        m => m.ProblemaFormComponent
                    )
            },
            {
                path: 'paciente/:id/evoluciones',
                loadComponent: () =>
                    import('./components/evolucion/evoluciones/evoluciones.component').then(
                        m => m.EvolucionesComponent
                    )
            },
            {
                path: 'paciente/:id/evoluciones/nueva',
                loadComponent: () =>
                    import('./components/evolucion/crear-evolucion/evolucion-form.component').then(
                        m => m.EvolucionFormComponent
                    )
            },
            {
                path: 'paciente/:id/archivos',
                loadComponent: () =>
                    import('./components/archivos/archivos.component').then(
                        m => m.ArchivosComponent
                    )
            },
            {
                path: 'plantillas/:id',
                loadComponent: () =>
                    import('./components/plantilla/crear-plantilla/plantilla').then(
                        m => m.PlantillaComponent
                    )
            },
            {
                path: 'plantillas',
                loadComponent: () =>
                    import('./components/plantilla/crear-plantilla/plantilla').then(
                        m => m.PlantillaComponent
                    )
            },
            {
                path: 'mis-plantillas',
                loadComponent: () =>
                    import('./components/plantilla/lista-plantillas/lista-plantillas').then(
                        m => m.ListaPlantillasComponent
                    )
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'pacientes',
            }
        ]
    }
];

