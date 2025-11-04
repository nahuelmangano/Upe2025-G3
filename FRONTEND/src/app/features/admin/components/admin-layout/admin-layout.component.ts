import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { UtilidadService } from '@core/services/utilidad.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';
import { PacienteContextService } from '@core/services/paciente-context.service';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    RouterModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent  {
  isDesktop = true;
  isExpanded = true;

  constructor(
    private router: Router,
    private utilidadSrv: UtilidadService,
    private pacienteContextService: PacienteContextService
  ){
    this.updateViewportFlags();
  }

  @HostListener('window:resize')
  onResize(){
    this.updateViewportFlags();
  }

  private updateViewportFlags(){
    this.isDesktop = window.innerWidth >= 960;
    this.isExpanded = this.isDesktop ? true : false;
  }

  toggleSidenav(){
    this.isExpanded = !this.isExpanded;
  }

  logout(): void {
    this.utilidadSrv.eliminarSesionUsuario();
    this.pacienteContextService.clearPacienteContext();
    this.router.navigate(['/login']);
  }

  onNavClick(sidenav: MatSidenav): void {
    if (!this.isDesktop) {
      sidenav.close();
      this.isExpanded = false;
    }
  }
}
