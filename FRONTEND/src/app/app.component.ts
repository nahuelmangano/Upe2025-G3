import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { PacientesService } from './services/pacientes.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-shell">
      <div class="topbar">
        <div class="brand">SALUD - UPE</div>
        <div class="user"><span class="avatar"></span> <small>Nombre user</small></div>
      </div>
      <aside class="sidebar">
        <div class="side-card" *ngIf="isPacienteCtx">
          <div class="side-photo" aria-label="Avatar paciente">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1f1f1f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
          </div>
          <div style="margin:10px 0 6px;font-weight:700;color:#fff">{{ pacienteNombre || 'Nombre del paciente' }}</div>
          <div class="btn-row"><button class="btn-outline">Salir</button><button class="btn-outline">Datos</button></div>
          <div class="side-grid">
            <div><small>Edad</small><div>{{ pacienteEdad ?? '—' }}</div></div>
            <div><small>nro HC</small><div>—</div></div>
            <div><small>DNI</small><div>{{ pacienteDni || '—' }}</div></div>
          </div>
        </div>
        <nav class="menu">
          <a routerLink="/pacientes" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Pacientes</a>
          <a *ngIf="isPacienteCtx" [routerLink]="pacienteLink('resumen')" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Resumen</a>
          <a *ngIf="isPacienteCtx" [routerLink]="pacienteLink('evoluciones')" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Evoluciones</a>
          <a *ngIf="isPacienteCtx" [routerLink]="pacienteLink('problemas')" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Problemas</a>
          <a routerLink="/plantillas" routerLinkActive="active">Plantillas</a>
          <a routerLink="/admin/usuarios" routerLinkActive="active">Admin: Usuarios</a>
        </nav>
      </aside>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
  `
})
export class AppComponent {
  isPacientes = false;
  isPacienteCtx = false;
  pacienteNombre = '';
  pacienteEdad: number | null = null;
  pacienteDni = '';
  pacienteId: number | null = null;
  constructor(public router: Router, private pacientes: PacientesService){
    const update = () => {
      this.isPacientes = this.router.url === '/pacientes' || this.router.url === '/';
      this.isPacienteCtx = this.router.url.startsWith('/pacientes/') && /\/pacientes\/(\d+)\//.test(this.router.url);
      if (this.isPacienteCtx) {
        const match = this.router.url.match(/^\/pacientes\/(\d+)\//);
        const id = match ? Number(match[1]) : 0;
        if (id) {
          this.pacienteId = id;
          this.pacientes.get(id).subscribe(p => {
            this.pacienteNombre = p?.nombre || '';
            this.pacienteDni = p?.dni || '';
            this.pacienteEdad = this.calcEdad(p?.fechaNac);
          });
        }
      } else {
        this.pacienteNombre = '';
        this.pacienteDni = '';
        this.pacienteEdad = null;
        this.pacienteId = null;
      }
    };
    update();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(update);
  }

  pacienteLink(seg: 'resumen'|'evoluciones'): string[] | string {
    const id = this.pacienteId ?? (this.router.url.match(/^\/pacientes\/(\d+)\//)?.[1]);
    return id ? `/pacientes/${id}/${seg}` : '/pacientes';
  }

  private calcEdad(fechaNacIso?: string): number | null {
    if (!fechaNacIso) return null;
    const d = new Date(fechaNacIso);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age;
  }
}
