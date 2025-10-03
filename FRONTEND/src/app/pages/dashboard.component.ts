import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  standalone: true, selector: 'app-dashboard', imports: [CommonModule],
  template: `
  <div class="grid-2">
    <div class="card">
      <h3 class="h3">Problemas y Antecedentes</h3>
      <div *ngFor="let p of resumen?.problemas" class="row">
        <span *ngIf="p.activo" class="badge">Activo</span>
        <span *ngIf="p.tipo" class="badge badge-danger">{{p.tipo}}</span>
        <span>{{p.titulo}}</span>
      </div>
    </div>
    <div class="card">
      <h3 class="h3">Evoluciones</h3>
      <div *ngFor="let e of resumen?.evoluciones" class="evo">
        <div><small>Listado cronológico</small></div>
        <div class="head"><strong>{{e.fecha}} | {{e.hora}}</strong><span>{{e.titulo}}</span></div>
        <div>{{e.descripcion}}</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <h3 class="h3">Indicaciones</h3>
    <table class="table"><thead><tr><th>Descripcion</th><th>Evolucion</th><th>Problema</th><th>Fecha</th></tr></thead>
      <tbody><tr *ngFor="let i of resumen?.indicaciones"><td>{{i.descripcion}}</td><td>{{i.evolucion}}</td><td>{{i.problema}}</td><td>{{i.fecha}}</td></tr></tbody>
    </table>
  </div>`
})
export class DashboardComponent{
  resumen:any; constructor(private api:ApiService){ this.api.getResumenPaciente(1).subscribe(d=>this.resumen=d); }
}
