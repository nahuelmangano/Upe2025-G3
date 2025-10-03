import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
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
        <div class="side-card" *ngIf="!isPacientes">
          <div class="side-photo">imgPaciente</div>
          <div style="margin:10px 0 6px;font-weight:700;color:#fff">Nombre del paciente</div>
          <div class="btn-row"><button class="btn-outline">Salir</button><button class="btn-outline">Datos</button></div>
          <div class="side-grid">
            <div><small>Edad</small><div>—</div></div>
            <div><small>nro HC</small><div>—</div></div>
            <div><small>DNI</small><div>—</div></div>
          </div>
        </div>
        <nav class="menu">
          <a routerLink="/pacientes" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Pacientes</a>
          <a *ngIf="!isPacientes" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">resumen</a>
          <a routerLink="/plantillas" routerLinkActive="active">Plantillas</a>
        </nav>
      </aside>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
  `
})
export class AppComponent {
  isPacientes = false;
  constructor(private router: Router){
    const update = () => this.isPacientes = this.router.url.startsWith('/pacientes') || this.router.url === '/';
    update();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(update);
  }
}

