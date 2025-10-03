import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { PlantillasComponent } from './pages/plantillas.component';
import { PacientesComponent } from './pages/pacientes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
  { path: 'pacientes', component: PacientesComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'plantillas', component: PlantillasComponent },
  { path: '**', redirectTo: '' }
];
