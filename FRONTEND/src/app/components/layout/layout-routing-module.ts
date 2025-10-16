import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { ProblemasComponent } from '../../paciente/pages/problemas.component';
import { ProblemaFormComponent } from '../../paciente/pages/problema-form.component';
import { EvolucionesComponent } from '../../paciente/pages/evoluciones.component';
import { EvolucionFormComponent } from '../../paciente/pages/evolucion-form.component';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'usuario', component: UsuarioComponent },
      { path: 'pacientes/:id/problemas', component: ProblemasComponent },
      { path: 'pacientes/:id/problemas/nuevo', component: ProblemaFormComponent },
      { path: 'pacientes/:id/evoluciones', component: EvolucionesComponent },
      { path: 'pacientes/:id/evoluciones/nueva', component: EvolucionFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
