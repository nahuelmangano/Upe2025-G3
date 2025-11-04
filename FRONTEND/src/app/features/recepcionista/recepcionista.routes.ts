import { Routes } from '@angular/router';
import { APP_ROLES } from '@core/constants/roles.constants';
import { RoleGuard } from '@core/guards/role.guard';

export const RECEPCIONISTA_ROUTES: Routes = [
  {
    path: 'recepcionista',
    canMatch: [RoleGuard],
    data: { role: APP_ROLES.RECEPCIONISTA },
    loadComponent: () =>
      import('../recepcionista/components/recepcionista-layout/recepcionista-layout.component').then(m => m.RecepcionistaLayoutComponent),
    children: [
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./components/lista-pacientes-recepcionista/lista-pacientes-recepcionista').then(
            m => m.ListaPacientesRecepcionistaComponent
          )
      },
      {
        path: 'pacientes/crear',
        loadComponent: () =>
          import('./components/crear-paciente-form/crear-paciente-form').then(
            m => m.CrearPacienteFormComponent
          )
      },
      {
        path: 'paciente/:id/editar',
        loadComponent: () =>
          import('./components/editar-paciente-form/editar-paciente-form').then(
            m => m.EditarPacienteFormComponent
          )
      },
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' }
    ]
  }
];