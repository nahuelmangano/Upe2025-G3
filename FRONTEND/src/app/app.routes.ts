import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { PlantillasComponent } from './pages/plantillas.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'plantillas', component: PlantillasComponent },
  { path: '**', redirectTo: '' }
];
