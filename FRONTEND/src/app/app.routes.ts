import { Routes } from '@angular/router';
import { ResumenPacienteComponent } from './pages/resumen-paciente.component';
import { PlantillasComponent } from './pages/plantillas.component';
import { PacientesComponent } from './pages/pacientes.component';
import { UsuariosComponent } from './admin/pages/usuarios.component';
import { EvolucionesComponent } from './paciente/pages/evoluciones.component';
import { EvolucionFormComponent } from './paciente/pages/evolucion-form.component';
import { ProblemaFormComponent } from './paciente/pages/problema-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
  { path: 'pacientes', component: PacientesComponent },
  { path: 'pacientes/:id/resumen', component: ResumenPacienteComponent },
  { path: 'pacientes/:id/evoluciones', component: EvolucionesComponent },
  { path: 'pacientes/:id/evoluciones/nueva', component: EvolucionFormComponent },
  { path: 'pacientes/:id/problemas', component: ProblemaFormComponent },
  { path: 'pacientes/:id/problemas/nuevo', component: ProblemaFormComponent },
  { path: 'admin/usuarios', component: UsuariosComponent },
  { path: 'plantillas', component: PlantillasComponent },
  { path: '**', redirectTo: '' }
];
