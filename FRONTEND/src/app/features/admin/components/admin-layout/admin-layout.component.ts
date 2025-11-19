import { Component, HostListener, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
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
export class AdminLayoutComponent implements AfterViewInit {
  isDesktop = true;
  isExpanded = true;
  usuarioNombre = '';
  toolbarHeight = 64;
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  private viewInitialized = false;
  private layoutExtraSpace = 80;

  get layoutHeight(): number {
    const base = Math.max(this.viewportHeight - this.toolbarHeight, 0);
    return Math.max(base + this.layoutExtraSpace, this.viewportHeight);
  }

  @ViewChild('toolbarRef') toolbarRef?: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private utilidadSrv: UtilidadService,
    private pacienteContextService: PacienteContextService,
    private cdRef: ChangeDetectorRef
  ){
    this.updateViewportFlags();
    this.updateUsuarioNombre();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.updateToolbarHeight();
  }

  @HostListener('window:resize')
  onResize(){
    this.updateViewportFlags();
  }

  private updateViewportFlags(){
    this.isDesktop = window.innerWidth >= 960;
    this.isExpanded = this.isDesktop ? true : false;
    this.viewportHeight = window.innerHeight;
    this.updateToolbarHeight();
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

  private updateUsuarioNombre(): void {
    const nombre = this.utilidadSrv.obtenerNombreCompletoUsuario()?.trim();
    this.usuarioNombre = nombre && nombre.length ? nombre : 'Usuario';
  }

  private updateToolbarHeight(): void {
    if (!this.viewInitialized) {
      this.toolbarHeight = this.isDesktop ? 64 : 72;
      return;
    }

    requestAnimationFrame(() => {
      const newHeight = this.toolbarRef?.nativeElement?.offsetHeight;
      const fallback = this.isDesktop ? 64 : 72;
      const heightToUse = newHeight && newHeight > 0 ? newHeight : fallback;
      if (this.toolbarHeight !== heightToUse) {
        this.toolbarHeight = heightToUse;
        this.cdRef.detectChanges();
      }
    });
  }
}
