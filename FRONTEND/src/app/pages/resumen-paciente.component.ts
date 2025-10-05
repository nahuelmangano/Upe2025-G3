import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  standalone: true,
  selector: 'app-resumen-paciente',
  imports: [CommonModule],
  template: `
  <div class="grid-2" style="align-items:start">
    <div class="card" style="min-height:300px">
      <h3 class="h3">Problemas y Antecedentes</h3>
      <div *ngIf="!resumen?.problemas?.length" class="row"><small>No hay registros</small></div>
      <div *ngFor="let p of resumen?.problemas" class="row">
        <span *ngIf="p.activo" class="badge">Activo</span>
        <span *ngIf="p.tipo" class="badge badge-danger">{{p.tipo}}</span>
        <span>{{p.titulo}}</span>
      </div>
    </div>
    <div class="card" style="min-height:300px">
      <h3 class="h3">Evoluciones</h3>
      <div *ngIf="!resumen?.evoluciones?.length" class="row"><small>No hay registros</small></div>
      <div *ngFor="let e of resumen?.evoluciones" class="evo">
        <div class="head"><strong>{{e.fecha}} | {{e.hora}}</strong><span>{{e.titulo}}</span></div>
        <div>{{e.descripcion}}</div>
      </div>
    </div>
  </div>`
})
export class ResumenPacienteComponent implements OnInit, OnDestroy {
  resumen: any;
  sub?: Subscription;
  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id')) || 0;
      if (!id) { return; }
      this.api.getResumenPaciente(id).subscribe(d => this.resumen = d);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
