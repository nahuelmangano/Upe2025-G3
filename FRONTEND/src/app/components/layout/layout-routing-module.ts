import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { ProblemasComponent } from '../../paciente/pages/problemas/problemas.component';
import { ProblemaFormComponent } from '../../paciente/pages/crear-problema/problema-form.component';
import { EvolucionesComponent } from '../../paciente/pages/evoluciones/evoluciones.component';
import { EvolucionFormComponent } from '../../paciente/pages/crear-evolucion/evolucion-form.component';
import { ResumenUsuarioComponent } from '../resumen-usuario/resumen-usuario.component';
import { PlantillaComponent } from '../plantilla/crear-plantilla/plantilla';
import { ListaPlantillasComponent } from '../plantilla/lista-plantillas/lista-plantillas';
import { ListaPacientesMedicoComponent } from '../../paciente/pages/lista-pacientes-medico/lista-pacientes-medico';
import { ListaPacientesRecepcionistaComponent } from '../../paciente/pages/lista-pacientes-recepcionista/lista-pacientes-recepcionista';
import { CrearPacienteFormComponent } from '../../paciente/pages/crear-paciente-form/crear-paciente-form'
import { EditarPacienteFormComponent } from 'src/app/paciente/pages/editar-paciente-form/editar-paciente-form';
import { LayoutComponent } from './layout.component';
import { ArchivosComponent } from '../../Archivos/archivos.component';
import { medicoGuard } from '../../guards/medico.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'usuarios', component: UsuarioComponent },
      { path: 'recepcionista/pacientes/crear', component: CrearPacienteFormComponent },
      { path: 'recepcionista/paciente/:id/editar', component: EditarPacienteFormComponent },
      { path: 'recepcionista/pacientes', component: ListaPacientesRecepcionistaComponent },
      { path: 'medico/pacientes', component: ListaPacientesMedicoComponent },
      { path: 'pacientes/:id/problemas', component: ProblemasComponent, canActivate: [medicoGuard] },
      { path: 'pacientes/:id/problemas/nuevo', component: ProblemaFormComponent, canActivate: [medicoGuard] },
      { path: 'pacientes/:id/evoluciones', component: EvolucionesComponent, canActivate: [medicoGuard] },
      { path: 'pacientes/:id/evoluciones/nueva', component: EvolucionFormComponent, canActivate: [medicoGuard] },
      { path: 'pacientes/:id/resumen', component: ResumenUsuarioComponent },
      { path: 'pacientes/:id/archivos', component: ArchivosComponent },
      { path: 'mis-plantillas', component: ListaPlantillasComponent },
      { path: 'plantillas/:id', component: PlantillaComponent }, 
      { path: 'plantillas', component: PlantillaComponent }, 
      
      { path: '', redirectTo: 'mis-plantillas', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
