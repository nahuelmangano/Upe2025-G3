import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { PlantillaComponent } from '../plantilla/crear-plantilla/plantilla';
import { ListaPlantillasComponent } from '../plantilla/lista-plantillas/lista-plantillas';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'usuario', component: UsuarioComponent },
      { path: 'plantillas', component: PlantillaComponent },
      { path: 'mis-plantillas', component: ListaPlantillasComponent },
      { path: '', redirectTo: 'mis-plantillas', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
