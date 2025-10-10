import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { EvolucionesService } from '../services/evoluciones.service';
import { TemplatesService } from '../../services-old/templates.service';
import { ProblemasService, Problema } from '../services/problemas.service';

@Component({
  standalone: true,
  selector: 'app-paciente-evolucion-form',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card">
      <h3 class="h3" style="margin-bottom:12px">Evolución</h3>
      <div style="display:grid;grid-template-columns:300px 1fr;gap:18px">
        <!-- Lateral problemas -->
        <div class="side-card" style="background:#f7f7fb;border:1px solid var(--line);border-radius:10px;padding:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <button class="btn" type="button" (click)="nuevoProblema()">+ Problema</button>
            <select [(ngModel)]="maxMostrar" style="height:34px">
              <option [ngValue]="10">Mostrar máximo 10</option>
              <option [ngValue]="25">Mostrar máximo 25</option>
              <option [ngValue]="100">Mostrar máximo 100</option>
            </select>
          </div>
          <div style="font-weight:600;margin:6px 0">Problema a asociar</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <button *ngFor="let pr of problemas" (click)="selectProblema(pr)" class="btn-outline" [ngStyle]="{borderColor: selectedProblema?.id===pr.id ? 'var(--primary)' : '#cfc7ff', color: selectedProblema?.id===pr.id ? 'var(--primary)' : '#6b7280'}">{{ pr.titulo }}</button>
          </div>
          <div style="margin-top:8px"><small>Mostrando {{ problemas.length }} registros</small></div>
        </div>

        <!-- Form principal -->
        <div>
          <div class="modal-grid" style="grid-template-columns: repeat(6, 1fr);align-items:center">
            <label style="grid-column:1/4">
              <span>Fecha y hora</span>
              <input type="datetime-local" [(ngModel)]="fechaHora" name="fechaHora" />
            </label>
            <div style="grid-column:4/7"></div>

            <label style="grid-column:1/7">
              <span>Problema</span>
              <input [value]="selectedProblema?.titulo || ''" placeholder="Seleccione desde la izquierda" disabled />
            </label>
            <label style="grid-column:1/3">
              <span>Plantillas</span>
              <select [(ngModel)]="plantillaId" (change)="applyTemplate()">
                <option [ngValue]="undefined">Seleccione</option>
                <option *ngFor="let t of plantillas" [ngValue]="t.id">{{t.titulo}}</option>
              </select>
            </label>
            <div style="grid-column:1/7">
              <span style="display:block;margin-bottom:6px;color:#374151;font-size:14px">Evolución</span>
              <textarea rows="12" [(ngModel)]="texto" placeholder="Ingrese aquí una evolución..."></textarea>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:10px">
            <div></div>
            <div style="display:flex;gap:10px">
              <button class="btn-outline" type="button" (click)="clear()">Limpiar</button>
              <button class="btn" type="button" (click)="guardar()">Guardar</button>
            </div>
          </div>
          <div style="text-align:right;margin-top:8px">
            <small>Evolucionado por <strong>Meredith Grey</strong></small>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EvolucionFormComponent implements OnInit, OnDestroy {
  pacienteId = 0;
  sub?: Subscription;

  problemas: Problema[] = [];
  selectedProblema: Problema | null = null;
  plantillas: any[] = [];
  plantillaId?: string;

  fechaHora = '';
  texto = '';
  maxMostrar = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evo: EvolucionesService,
    private tpl: TemplatesService,
    private probs: ProblemasService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(async pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.probs.list().subscribe(p => this.problemas = p);
      this.tpl.list().subscribe(list => this.plantillas = list);
      const now = new Date();
      this.fechaHora = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,16);
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  selectProblema(p: Problema){ this.selectedProblema = p; }
  applyTemplate(){ const t = this.plantillas.find(x=>x.id===this.plantillaId); if(t){ this.texto = t.cuerpo; } }
  clear(){ this.texto=''; this.plantillaId=undefined; }
  async guardar(){
    const payload = {
      descripcion: this.texto,
      fechaConsulta: new Date(this.fechaHora).toISOString(),
      diagnosticoInicial: this.texto?.slice(0,50) || 'Sin detalle',
      diagnosticoDefinitivo: undefined,
      pacienteId: this.pacienteId,
      problemaId: this.selectedProblema?.id
    };
    await firstValueFrom(this.evo.create(payload));
    this.router.navigate(['/pacientes', this.pacienteId, 'evoluciones']);
  }
  nuevoProblema(){ this.router.navigate(['/pacientes', this.pacienteId, 'problemas', 'nuevo']); }
}
