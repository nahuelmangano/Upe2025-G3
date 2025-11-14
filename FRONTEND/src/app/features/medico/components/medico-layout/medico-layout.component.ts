import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { PacienteService } from '@features/paciente/services/paciente.service';
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
  templateUrl: './medico-layout.component.html',
  styleUrls: ['./medico-layout.component.css']
})
export class MedicoLayoutComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  isDesktop = true;
  isExpanded = true;
  isPacienteCtx = false;
  
  pacienteNombre = '';
  pacienteEdad: number | null = null;
  pacienteDni = '';
  pacienteHC = '';
  pacienteIniciales = '';
  medicoNombre = '';
  private routerSub?: Subscription;
  private pacienteSub?: Subscription;

  constructor(
    private router: Router,
    private pacientesSrv: PacienteService,
    private utilidadSrv: UtilidadService,
    private pacienteContextService: PacienteContextService,
    private scroller: ViewportScroller
  ) {
    this.updateViewportFlags();
    this.updateMedicoNombre();
  }

  ngOnInit(): void {
    this.updateMedicoNombre();
    this.pacienteContextService.pacienteId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        if (id) {
          this.isPacienteCtx = true;
          this.loadPaciente(id);
        } else {
          this.isPacienteCtx = false;
          this.resetPaciente();
        }
      });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pacienteSub?.unsubscribe();
  }

  onNavClick(sidenav: MatSidenav): void {
    if (!this.isDesktop) {
      sidenav.close();
      this.isExpanded = false;
    }
  }

  salirDelPacienteContexto(): void {
    this.pacienteContextService.clearPacienteContext();
    this.router.navigate(['/medico/pacientes']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
    })
  }

  pacienteRoute(seg: string): any[] {
    const pacienteId = this.pacienteContextService.getPacienteIdActual();
    return pacienteId ? ['/medico', 'paciente', pacienteId, seg] : ['/medico'];
  }

  private resetPaciente(): void {
    this.pacienteNombre = '';
    this.pacienteEdad = null;
    this.pacienteDni = '';
    this.pacienteHC = '';
    this.pacienteIniciales = '';
  }

  private loadPaciente(id: number): void {
    this.pacienteSub?.unsubscribe();
    this.pacienteSub = this.pacientesSrv.obtener(id).subscribe({
      next: paciente => {
        const nombre = paciente?.nombre?.trim() || '';
        const fecha = (paciente as any)?.fechaNac ?? paciente?.fechaNac;
        this.pacienteNombre = nombre || 'Nombre del paciente';
        this.pacienteIniciales = this.buildInitials(this.pacienteNombre);
        this.pacienteEdad = this.calcEdad(fecha);
        this.pacienteDni = paciente?.dni ?? '';
        const hc = (paciente as any)?.numeroHistoriaClinica ?? (paciente?.id ? paciente.id.toString().padStart(6, '0') : '');
        this.pacienteHC = hc || '';
      },
      error: () => {
        this.pacienteNombre = 'Nombre del paciente';
        this.pacienteIniciales = 'P';
      }
    });
  }

  private calcEdad(fechaNac?: string | Date): number | null {
    if (!fechaNac) return null;
    const fecha = fechaNac instanceof Date ? fechaNac : new Date(fechaNac);
    if (Number.isNaN(fecha.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  }

  private buildInitials(nombre: string): string {
    if (!nombre) return 'P';
    const parts = nombre.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'P';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  private updateMedicoNombre(): void {
    const nombre = (this.utilidadSrv.obtenerNombreCompletoUsuario() || '').trim();
    this.medicoNombre = nombre || 'No disponible';
  }
}
