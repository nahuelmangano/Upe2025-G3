import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { EvolucionesService, Evolucion, EvolucionInput } from '../services/evoluciones.service';

@Component({
  standalone: true,
  selector: 'app-paciente-evoluciones',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card" style="margin-bottom:12px">
      <h3 class="h3" style="margin-bottom:12px">Evoluciones</h3>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px">
        <button class="btn" type="button" (click)="openModal()">+ Nueva Evolucion</button>
        <input [(ngModel)]="q" placeholder="Buscar..." style="flex:1" />
      </div>

      <div *ngIf="loading">Cargando evoluciones...</div>
      <div *ngIf="error" style="color:#d63031">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Problema</th>
                <th>Paciente</th>
                <th>Diagnostico Inicial</th>
                <th>Diagnostico Final</th>
                <th>Medico</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of pageItems()">
                <td>{{ e.problema }}</td>
                <td>{{ e.paciente }}</td>
                <td>{{ e.diagnosticoInicial }}</td>
                <td>{{ e.diagnosticoFinal }}</td>
                <td>{{ e.medico }}</td>
                <td>{{ e.estado }}</td>
                <td>
                  <div style="display:flex;gap:10px;align-items:center">
                    <a (click)="openEdit(e)" title="Editar" style="cursor:pointer;color:#4b5563">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </a>
                  </div>
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

    <!-- Modal crear/editar -->
    <div *ngIf="modalOpen" class="modal-backdrop">
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 class="h3" style="margin:0">{{ editId ? 'Editar Evolucion' : 'Nueva Evolucion' }}</h3>
          <button class="btn-outline" type="button" (click)="closeModal()">x</button>
        </div>

        <form (ngSubmit)="save()" #evoForm="ngForm" style="display:grid;gap:12px">
          <div class="modal-grid">
            <label>
              <span>Fecha de consulta</span>
              <input type="date" required [(ngModel)]="fecha" name="fecha" />
            </label>
            <label class="full">
              <span>Diagnostico Inicial</span>
              <input required [(ngModel)]="form.diagnosticoInicial" name="diagnosticoInicial" />
            </label>
            <label class="full">
              <span>Diagnostico Final</span>
              <input [(ngModel)]="form.diagnosticoDefinitivo" name="diagnosticoDefinitivo" />
            </label>
            <label class="full">
              <span>Descripcion</span>
              <textarea rows="4" [(ngModel)]="form.descripcion" name="descripcion"></textarea>
            </label>
          </div>

          <div *ngIf="modalError" style="color:#d63031">{{ modalError }}</div>

          <div style="display:flex;gap:10px;justify-content:flex-end">
            <button class="btn-outline" type="button" (click)="closeModal()">Cancelar</button>
            <button class="btn" type="submit" [disabled]="saving || evoForm.invalid">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `.modal-grid .full{grid-column:1/-1}`
  ]
})
export class EvolucionesComponent implements OnInit, OnDestroy {
  pacienteId = 0;
  sub?: Subscription;

  q = '';
  data: Evolucion[] = [];
  page = 0;
  pageSize = 5;
  loading = false;
  error = '';

  modalOpen = false;
  saving = false;
  modalError = '';
  editId: number | null = null;
  fecha = '';
  form: Partial<EvolucionInput> = { diagnosticoInicial: '' };

  constructor(private route: ActivatedRoute, private evoluciones: EvolucionesService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.load();
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private load(): void {
    this.loading = true; this.error='';
    this.evoluciones.listByPaciente(this.pacienteId).subscribe({
      next: items => { this.data = items; this.loading=false; this.page=0; },
      error: () => { this.loading=false; this.error='No pudimos cargar evoluciones'; }
    });
  }

  filtradas(): Evolucion[] {
    const term = this.q.toLowerCase();
    return this.data.filter(e => `${e.problema} ${e.paciente} ${e.diagnosticoInicial} ${e.diagnosticoFinal} ${e.medico} ${e.estado}`.toLowerCase().includes(term));
  }
  pagesCount(): number { return Math.max(1, Math.ceil(this.filtradas().length / this.pageSize)); }
  pageItems(): Evolucion[] { const s = this.page * this.pageSize; return this.filtradas().slice(s, s + this.pageSize); }
  rangeLabel(): string { const t = this.filtradas().length; const s = t ? this.page * this.pageSize + 1 : 0; const e = Math.min(t, (this.page + 1) * this.pageSize); return `${s} - ${e} of ${t}`; }
  prev(): void { if (this.page>0) this.page--; }
  next(): void { if ((this.page+1) < this.pagesCount()) this.page++; }

  openModal(): void { this.router.navigate(['/pacientes', this.pacienteId, 'evoluciones', 'nueva']); }
  openEdit(e: Evolucion): void { this.modalOpen = true; this.modalError=''; this.editId=e.id; this.fecha = e.fecha ? e.fecha.substring(0,10) : ''; this.form={ diagnosticoInicial: e.diagnosticoInicial, diagnosticoDefinitivo: e.diagnosticoFinal, descripcion: '' }; }
  closeModal(): void { if(!this.saving) this.modalOpen = false; }

  async save(): Promise<void> {
    if (this.saving) return; this.saving = true; this.modalError='';
    try {
      const base: EvolucionInput = {
        descripcion: this.form.descripcion,
        fechaConsulta: this.fecha ? new Date(this.fecha).toISOString() : new Date().toISOString(),
        diagnosticoInicial: this.form.diagnosticoInicial || '',
        diagnosticoDefinitivo: this.form.diagnosticoDefinitivo,
        pacienteId: this.pacienteId
      };
      if (this.editId) {
        await firstValueFrom(this.evoluciones.update({ id: this.editId, ...base }));
        this.data = this.data.map(x => x.id === this.editId ? { ...x, diagnosticoInicial: base.diagnosticoInicial, diagnosticoFinal: base.diagnosticoDefinitivo, fecha: base.fechaConsulta } : x);
      } else {
        const nuevo = await firstValueFrom(this.evoluciones.create(base));
        this.data = [nuevo, ...this.data];
      }
      this.page = 0; this.q=''; this.closeModal();
    } catch (e:any) {
      this.modalError = e?.message || 'No pudimos guardar la evolución';
    } finally { this.saving = false; }
  }
}
