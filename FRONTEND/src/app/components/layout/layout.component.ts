import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../reutilizable/shared/shared-module';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PacientesService } from '../../services-old/pacientes.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnDestroy {
  isDesktop = true;
  isExpanded = true;
  isPacienteCtx = false;
  pacienteId: number | null = null;
  pacienteNombre = '';
  pacienteEdad: number | null = null;
  pacienteDni = '';
  pacienteHC = '';
  pacienteIniciales = '';
  private routerSub?: Subscription;
  private pacienteSub?: Subscription;

  constructor(private router: Router, private pacientesSrv: PacientesService){
    this.updateViewportFlags();
    this.updateContext(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateContext(this.router.url));
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

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.pacienteSub?.unsubscribe();
  }

  onNavClick(sidenav: MatSidenav): void {
    if (!this.isDesktop) {
      sidenav.close();
      this.isExpanded = false;
    }
  }

  pacienteRoute(seg: string): any[] {
    return this.pacienteId ? ['/pages', 'paciente', this.pacienteId, seg] : ['/pages'];
  }

  private updateContext(url: string): void {
    const match = url.match(/\/pages\/paciente\/(\d+)/);
    const id = match ? Number(match[1]) : null;
    const isCtx = /\/pages\/paciente\/\d+\//.test(url);
    this.isPacienteCtx = !!(isCtx && id);
    this.isExpanded = this.isDesktop ? true : false;
    if (!id) {
      this.resetPaciente();
      return;
    }
    if (this.pacienteId !== id) {
      this.pacienteId = id;
      this.loadPaciente(id);
    }
  }

  private resetPaciente(): void {
    this.pacienteId = null;
    this.pacienteNombre = '';
    this.pacienteEdad = null;
    this.pacienteDni = '';
    this.pacienteHC = '';
    this.pacienteIniciales = '';
  }

  private loadPaciente(id: number): void {
    this.pacienteSub?.unsubscribe();
    this.pacienteSub = this.pacientesSrv.get(id).subscribe({
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
}
