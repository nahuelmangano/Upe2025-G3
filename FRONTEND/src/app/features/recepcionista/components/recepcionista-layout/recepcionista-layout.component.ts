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
  templateUrl: './recepcionista-layout.component.html',
  styleUrls: ['./recepcionista-layout.component.css']
})
export class RecepcionistaLayoutComponent {
  isDesktop = true;
  isExpanded = true;
  usuarioNombre = '';

  constructor(
    private router: Router,
    private utilidadSrv: UtilidadService,
    private pacienteContextService: PacienteContextService
  ) {
    this.updateViewportFlags();
    this.updateUsuarioNombre();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewportFlags();
  }

  private updateViewportFlags() {
    this.isDesktop = window.innerWidth >= 960;
    this.isExpanded = this.isDesktop ? true : false;
  }

  toggleSidenav() {
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

  private updateUsuarioNombre(): void {
    const nombre = this.utilidadSrv.obtenerNombreCompletoUsuario()?.trim();
    this.usuarioNombre = nombre && nombre.length ? nombre : 'Usuario';
  }
}
