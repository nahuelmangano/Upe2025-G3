import { Routes } from '@angular/router';
// import { ResumenPacienteComponent } from './pages-old/resumen-paciente.component';
// import { PlantillasComponent } from './pages-old/plantillas.component';
// import { PacientesComponent } from './pages-old/pacientes.component';
// import { UsuariosComponent } from './admin/pages/usuarios.component';
// import { EvolucionesComponent } from './paciente/pages/evoluciones.component';
// import { EvolucionFormComponent } from './paciente/pages/evolucion-form.component';
// import { ProblemaFormComponent } from './paciente/pages/problema-form.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  // { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
  // { path: 'pacientes', component: PacientesComponent },
  // { path: 'pacientes/:id/resumen', component: ResumenPacienteComponent },
  // { path: 'pacientes/:id/evoluciones', component: EvolucionesComponent },
  // { path: 'pacientes/:id/evoluciones/nueva', component: EvolucionFormComponent },
  // { path: 'pacientes/:id/problemas', component: ProblemaFormComponent },
  // { path: 'pacientes/:id/problemas/nuevo', component: ProblemaFormComponent },
  // { path: 'admin/usuarios', component: UsuariosComponent },
  // { path: 'plantillas', component: PlantillasComponent },
  // { path: 'plantillas/:id', component: PlantillaComponent},
  // { path: '**', redirectTo: '' }

  { path: 'login', component: LoginComponent },

  {
    path: 'pages',
    loadChildren: () =>
      import('./components/layout/layout-routing-module').then(m => m.LayoutRoutingModule)
  },

  // Redirección para rutas inválidas
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
