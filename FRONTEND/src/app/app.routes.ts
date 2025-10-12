import { Routes } from '@angular/router';
import { ResumenPacienteComponent } from './pages/resumen-paciente.component';
import { PlantillasComponent } from './pages/plantillas.component';
import { PacientesComponent } from './pages/pacientes.component';
import { UsuariosComponent } from './admin/pages/usuarios.component';
import { EvolucionesComponent } from './paciente/pages/evoluciones.component';
import { EvolucionFormComponent } from './paciente/pages/evolucion-form.component';
import { ProblemaFormComponent } from './paciente/pages/problema-form.component';
import { LoginComponent } from './pages/login.component';
import { authGuard, adminGuard, nonAdminGuard, nonRecepcionistaGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'pacientes', component: PacientesComponent, canActivate: [authGuard, nonAdminGuard] },
  { path: 'pacientes/:id/resumen', component: ResumenPacienteComponent, canActivate: [authGuard, nonAdminGuard, nonRecepcionistaGuard] },
  { path: 'pacientes/:id/evoluciones', component: EvolucionesComponent, canActivate: [authGuard, nonAdminGuard, nonRecepcionistaGuard] },
  { path: 'pacientes/:id/evoluciones/nueva', component: EvolucionFormComponent, canActivate: [authGuard, nonAdminGuard, nonRecepcionistaGuard] },
  { path: 'pacientes/:id/problemas', component: ProblemaFormComponent, canActivate: [authGuard, nonAdminGuard, nonRecepcionistaGuard] },
  { path: 'pacientes/:id/problemas/nuevo', component: ProblemaFormComponent, canActivate: [authGuard, nonAdminGuard, nonRecepcionistaGuard] },
  { path: 'admin/usuarios', component: UsuariosComponent, canActivate: [authGuard, adminGuard] },
  { path: 'plantillas', component: PlantillasComponent, canActivate: [authGuard, nonAdminGuard, nonRecepcionistaGuard] },
  { path: '**', redirectTo: 'login' }
];
