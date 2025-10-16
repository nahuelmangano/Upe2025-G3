import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { EvolucionService } from '../../services/evolucion.service';
import { Evolucion } from '../../interfaces/evolucion';
import { ProblemaService } from '../../services/problema.service';

interface ProblemaRow { id: number; titulo: string; estadoNombre?: string }

@Component({
  standalone: true,
  selector: 'app-paciente-problemas',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card" style="margin-bottom:12px">
      <h3 class="h3" style="margin-bottom:12px">Problema</h3>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px">
        <button class="btn" type="button" (click)="nuevo()">+ Nuevo Problema</button>
        <input [(ngModel)]="q" placeholder="Buscar..." style="flex:1" />
      </div>

      <div *ngIf="loading">Cargando problemas...</div>
      <div *ngIf="error" style="color:#d63031">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Inicio</th>
                <th>Profesional</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Evoluciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pageItems()">
                <td>{{ p.titulo }}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>{{ p.estadoNombre || '-' }}</td>
                <td>
                  <a (click)="verEvoluciones()" title="Ver" style="cursor:pointer;color:#4b5563">Ver</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px">
          <div style="display:flex; gap:8px; align-items:center">
            <small>Items per page:</small>
            <select [(ngModel)]="pageSize">
              <option [ngValue]="5">5</option>
              <option [ngValue]="10">10</option>
            </select>
          </div>
          <div style="display:flex; gap:10px; align-items:center">
            <small>{{ rangeLabel() }}</small>
            <button class="btn-outline" (click)="prev()" [disabled]="page===0"><</button>
            <button class="btn-outline" (click)="next()" [disabled]="(page+1)>=pagesCount()">></button>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class ProblemasComponent implements OnInit, OnDestroy {
  pacienteId = 0;
  sub?: Subscription;

  q = '';
  data: ProblemaRow[] = [];
  page = 0;
  pageSize = 5;
  loading = false;
  error = '';
  private titulos = new Map<number, string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evolucionSrv: EvolucionService,
    private problemaSrv: ProblemaService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.load();
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private load(): void {
    this.loading = true; this.error='';
    // Cargar catálogo (para mapear id -> título) y luego las evoluciones
    this.problemaSrv.lista().subscribe({
      next: (resp:any) => {
        const items: any[] = resp?.estado ? (resp.valor || []) : [];
        try { items.forEach((p:any)=>{ if(p?.id) this.titulos.set(p.id, p.titulo ?? ''); }); } catch {}
      },
      complete: () => this.loadEvoluciones(),
      error: () => this.loadEvoluciones()
    });
  }

  private loadEvoluciones(){
    this.evolucionSrv.listaPorPaciente(this.pacienteId).subscribe({
      next: (resp:any) => {
        const raw: any[] = resp?.estado ? (resp.valor || []) : [];
        const evos: Evolucion[] = raw.map((it:any) => ({
          id: it.id,
          descripcion: it.descripcion ?? it.Descripcion,
          fechaConsulta: it.fechaConsulta ?? it.FechaConsulta,
          diagnosticoInicial: it.diagnosticoInicial ?? it.DiagnosticoInicial,
          diagnosticoDefinitivo: it.diagnosticoDefinitivo ?? it.DiagnosticoDefinitivo,
          pacienteId: it.pacienteId ?? it.PacienteId,
          pacienteNombre: it.pacienteNombre ?? it.PacienteNombre,
          plantillaId: it.plantillaId ?? it.PlantillaId,
          plantillaNombre: it.plantillaNombre ?? it.PlantillaNombre,
          problemaId: it.problemaId ?? it.ProblemaId,
          problemaTitulo: it.problemaTitulo ?? it.ProblemaTitulo,
          estadoProblemaId: it.estadoProblemaId ?? it.EstadoProblemaId,
          estadoProblemaNombre: it.estadoProblemaNombre ?? it.EstadoProblemaNombre,
          medicoId: it.medicoId ?? it.MedicoId,
          medicoNombre: it.medicoNombre ?? it.MedicoNombre
        }));
        // Agrupar por problemaId y tomar el último estado por fecha
        const byId = new Map<number, Evolucion[]>();
        evos.forEach(e => {
          const id = e.problemaId ?? 0;
          const key = Number.isFinite(id) && id > 0 ? id : -1;
          const arr = byId.get(key) || [];
          arr.push(e);
          byId.set(key, arr);
        });
        // Si no tenemos problemaId en la interfaz, agrupamos por título
        if (byId.size === 1 && byId.has(-1)) {
          const byTitle = new Map<string, Evolucion[]>();
          evos.forEach(e => {
            const t = e.problemaTitulo || '-';
            const arr = byTitle.get(t) || [];
            arr.push(e);
            byTitle.set(t, arr);
          });
          this.data = Array.from(byTitle.entries()).map(([titulo, arr], idx) => {
            const last = arr.sort((a,b)=> new Date(b.fechaConsulta as any).getTime()-new Date(a.fechaConsulta as any).getTime())[0];
            return { id: idx+1, titulo, estadoNombre: last?.estadoProblemaNombre ?? undefined };
          });
        } else {
          this.data = Array.from(byId.entries()).filter(([k])=>k>0).map(([key, arr]) => {
            const last = arr.sort((a,b)=> new Date(b.fechaConsulta as any).getTime()-new Date(a.fechaConsulta as any).getTime())[0];
            const titulo = last?.problemaTitulo || this.titulos.get(key) || '-';
            return { id: key, titulo, estadoNombre: last?.estadoProblemaNombre ?? undefined };
          });
        }
        this.loading=false; this.page=0;
      },
      error: () => { this.loading=false; this.error='No pudimos cargar problemas del paciente'; }
    });
  }

  filtradas(): ProblemaRow[] {
    const term = this.q.toLowerCase();
    return this.data.filter(p => `${p.titulo} ${p.estadoNombre}`.toLowerCase().includes(term));
  }
  pagesCount(): number { return Math.max(1, Math.ceil(this.filtradas().length / this.pageSize)); }
  pageItems(): ProblemaRow[] { const s = this.page * this.pageSize; return this.filtradas().slice(s, s + this.pageSize); }
  rangeLabel(): string { const t = this.filtradas().length; const s = t ? this.page * this.pageSize + 1 : 0; const e = Math.min(t, (this.page + 1) * this.pageSize); return `${s} - ${e} of ${t}`; }
  prev(): void { if (this.page>0) this.page--; }
  next(): void { if ((this.page+1) < this.pagesCount()) this.page++; }

  nuevo(): void { this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'problemas', 'nuevo']); }
  verEvoluciones(): void { this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'evoluciones']); }
}
