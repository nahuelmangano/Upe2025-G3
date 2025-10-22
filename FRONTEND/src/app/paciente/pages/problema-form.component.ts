import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { ProblemasService, Problema } from '../services/problemas.service';
import { PacienteCatalogoService, Opcion } from '../services/catalogo.service';

@Component({
  standalone: true,
  selector: 'app-paciente-problema-form',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card">
      <h3 class="h3" style="margin-bottom:12px">Problemas</h3>
      <div class="modal-grid" style="grid-template-columns: 1fr 1fr">
        <label>
          <span>Título</span>
          <input
            [(ngModel)]="titulo"
            name="titulo"
            type="text"
            placeholder="Escribí el nombre del problema"
            list="sugerencias-problema"
          />
          <datalist id="sugerencias-problema">
            <option *ngFor="let p of opcionesTitulo" [value]="p.titulo || ''"></option>
          </datalist>
        </label>
        <label>
          <span>Estado</span>
          <select [(ngModel)]="estadoId" name="estadoId">
            <option *ngFor="let e of estados" [ngValue]="e.id">{{e.nombre}}</option>
          </select>
        </label>
        <div style="grid-column:1/3">
          <a href="#" (click)="$event.preventDefault()">Editar</a>
        </div>
        <label style="grid-column:1/3">
          <span>Descripcion</span>
          <textarea rows="6" [(ngModel)]="descripcion" name="descripcion"></textarea>
        </label>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:12px">
        <button class="btn-outline" type="button" (click)="cancelar()">Cancelar</button>
        <button class="btn" type="button" (click)="crear()">Crear</button>
      </div>
    </div>
  `
})
export class ProblemaFormComponent implements OnInit, OnDestroy {
  pacienteId = 0;
  sub?: Subscription;
  opcionesTitulo: Problema[] = [];
  estados: Opcion[] = [];

  titulo = '';
  estadoId?: number;
  descripcion = '';

  constructor(private route: ActivatedRoute, private router: Router, private problemas: ProblemasService, private catalogo: PacienteCatalogoService) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.problemas.list().subscribe(p => { this.opcionesTitulo = p; });
      this.catalogo.estadosProblema().subscribe(e => { this.estados = e; this.estadoId = e[0]?.id; });
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  cancelar(): void { this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'evoluciones']); }

  async crear(): Promise<void> {
    await firstValueFrom(this.problemas.create({ titulo: this.titulo, descripcion: this.descripcion, estadoProblemaId: this.estadoId }));
    this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'evoluciones']);
  }
}

