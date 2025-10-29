import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map as rxMap, tap } from 'rxjs/operators';
import { EvolucionesService, EvolucionInput } from '../services/evoluciones.service';
import { EvolucionService } from '../../services/evolucion.service';
import { EstudioService } from '../../services/estudio.service';
import { ArchivoAdjuntoService } from '../../services/archivo-adjunto.service';
import { Evolucion as EvolucionModel } from '../../interfaces/evolucion';
import { ProblemaService } from '../../services/problema.service';
import { MedicoService } from '../../services/medico.service';
import { EstadoProblemaService } from '../../services/estado-problema.service';

interface EvolucionRow {
  id: number;
  problema: string;
  diagnosticoInicial: string;
  diagnosticoFinal?: string;
  medico: string;
  estado: string;
  fecha?: string;
  problemaId?: number;
  estadoId?: number;
  medicoId?: number;
  source?: any;
}

interface ArchivoRow {
  id: number;
  nombre: string;
  tamano: number;
}

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
                <th>Diagnostico Inicial</th>
                <th>Diagnostico Final</th>
                <th>Medico</th>
                <th>Estado</th>
                <th>Estudios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of pageItems()">
                <td>{{ e.problema }}</td>
                <td>{{ e.diagnosticoInicial }}</td>
                <td>{{ e.diagnosticoFinal }}</td>
                <td>{{ e.medico }}</td>
                <td>{{ e.estado }}</td>
                <td>
                  <a (click)="openEstudios(e)" title="Ver estudios" style="cursor:pointer;color:#4b5563">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <path d="M14 2v6h6"/>
                    </svg>
                  </a>
                </td>
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
            <label class="full">
              <span>Estado del problema</span>
              <select [(ngModel)]="editEstadoId" name="estadoProblema">
                <option *ngFor="let est of estadoOptions" [ngValue]="est.id">{{ est.nombre }}</option>
              </select>
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

    <!-- Modal estudios por evolución -->
    <div *ngIf="estudiosModal" class="modal-backdrop">
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 class="h3" style="margin:0">Estudios</h3>
          <button class="btn-outline" type="button" (click)="closeEstudios()">x</button>
        </div>
        <div *ngIf="estudiosLoading">Cargando estudios...</div>
        <div *ngIf="!estudiosLoading">
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Tamaño</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of estudios">
                  <td>{{ s.nombre }}</td>
                  <td>{{ s.tamano | number }} bytes</td>
                  <td>
                    <a [href]="archivoSrv.descargar(s.id)" title="Descargar" target="_blank">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <path d="M7 10l5 5 5-5"/>
                        <path d="M12 15V3"/>
                      </svg>
                    </a>
                  </td>
                </tr>
                <tr *ngIf="estudios.length===0"><td colspan="3">Sin archivos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.modal-grid .full{grid-column:1/-1}
    /* Rayado de filas: una blanca, una gris */
.table tbody tr:nth-child(odd)  { background: #ffffff; }
.table tbody tr:nth-child(even) { background: #f5f6f8; }`
    
  ]
})
export class EvolucionesComponent implements OnInit, OnDestroy {
  pacienteId = 0;
  sub?: Subscription;

  q = '';
  data: EvolucionRow[] = [];
  page = 0;
  pageSize = 5;
  loading = false;
  error = '';
  private catalogSub?: Subscription;
  private catalogsLoaded = false;
  private problemaMap = new Map<number, string>();
  private medicoMap = new Map<number, string>();
  private estadoMap = new Map<number, string>();
  estadoOptions: { id: number; nombre: string }[] = [];

  modalOpen = false;
  saving = false;
  modalError = '';
  editId: number | null = null;
  fecha = '';
  form: Partial<EvolucionInput> = { diagnosticoInicial: '' };
  private editProblemaId?: number;
  private editEstadoId?: number;
  private editMedicoId?: number;
  private editSource: any;

  estudiosModal = false;
  estudiosLoading = false;
  estudios: ArchivoRow[] = [];

  constructor(
    private route: ActivatedRoute,
    private evolucionesSrv: EvolucionesService,
    private evolucionSrv: EvolucionService,
    private estudioSrv: EstudioService,
    private archivoSrv: ArchivoAdjuntoService,
    private problemaSrv: ProblemaService,
    private medicoSrv: MedicoService,
    private estadoSrv: EstadoProblemaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.fetchData();
    });
  }

  openEstudios(e: EvolucionRow): void {
    this.estudiosModal = true;
    this.estudiosLoading = true;
    this.estudios = [];
    this.estudioSrv.listaPorEvolucion(e.id).subscribe({
      next: (resp: any) => {
        const estudios: any[] = resp?.estado ? (resp.valor || []) : [];
        if (!estudios.length) { this.estudiosLoading = false; return; }
        const calls = estudios.map(es => this.archivoSrv.listaPorEstudio(es.id));
        forkJoin(calls).subscribe({
          next: (resps: any[]) => {
            const all = resps.flatMap(r => (r?.valor || []) as any[]);
            this.estudios = all.map(a => ({ id: a?.id ?? 0, nombre: a?.nombreArchivo ?? '-', tamano: a?.tamano ?? 0 }));
            this.estudiosLoading = false;
          },
          error: () => { this.estudiosLoading = false; this.estudios = []; }
        });
      },
      error: () => { this.estudiosLoading = false; this.estudios = []; }
    });
  }

  closeEstudios(): void {
    this.estudiosModal = false;
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.catalogSub?.unsubscribe();
  }

  private fetchData(): void {
    this.loading = true; this.error='';
    const catalogs$ = this.ensureCatalogs();
    this.catalogSub?.unsubscribe();
    this.catalogSub = catalogs$.subscribe({
      next: () => this.loadEvoluciones(),
      error: () => this.loadEvoluciones()
    });
  }

  private loadEvoluciones(): void {
    this.loading = true; this.error='';
    this.evolucionSrv.listaPorPaciente(this.pacienteId).subscribe({
      next: (resp: any) => {
        const items: any[] = resp?.estado ? (resp.valor || []) : [];
        this.data = items.map(it => this.mapRow(it));
        this.loading=false; this.page=0;
      },
      error: () => { this.loading=false; this.error='No pudimos cargar evoluciones'; }
    });
  }

  filtradas(): EvolucionRow[] {
    const term = this.q.toLowerCase();
    return this.data.filter(e => `${e.problema} ${e.diagnosticoInicial} ${e.diagnosticoFinal} ${e.medico} ${e.estado}`.toLowerCase().includes(term));
  }
  pagesCount(): number { return Math.max(1, Math.ceil(this.filtradas().length / this.pageSize)); }
  pageItems(): EvolucionRow[] { const s = this.page * this.pageSize; return this.filtradas().slice(s, s + this.pageSize); }
  rangeLabel(): string { const t = this.filtradas().length; const s = t ? this.page * this.pageSize + 1 : 0; const e = Math.min(t, (this.page + 1) * this.pageSize); return `${s} - ${e} of ${t}`; }
  prev(): void { if (this.page>0) this.page--; }
  next(): void { if ((this.page+1) < this.pagesCount()) this.page++; }

  openModal(): void { this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'evoluciones', 'nueva']); }
  openEdit(e: EvolucionRow): void {
    this.modalOpen = true;
    this.modalError='';
    this.editId = e.id;
    this.fecha = e.fecha ? e.fecha.substring(0,10) : '';
    const src = e.source || {};
    this.editSource = src;
    this.editProblemaId = this.toNumberOrUndefined(e.problemaId ?? src.problemaId ?? src.ProblemaId, true);
    this.editEstadoId = this.toNumberOrUndefined(e.estadoId ?? src.estadoProblemaId ?? src.EstadoProblemaId, true) ?? this.estadoOptions[0]?.id;
    this.editMedicoId = this.toNumberOrUndefined(e.medicoId ?? src.medicoId ?? src.MedicoId, true);
    this.form = {
      diagnosticoInicial: e.diagnosticoInicial,
      diagnosticoDefinitivo: e.diagnosticoFinal,
      descripcion: ''
    };
  }
  closeModal(): void {
    if (this.saving) { return; }
    this.modalOpen = false;
    this.editId = null;
    this.editProblemaId = undefined;
    this.editEstadoId = undefined;
    this.editMedicoId = undefined;
    this.editSource = undefined;
    this.form = { diagnosticoInicial: '' };
    this.fecha = '';
  }

  async save(): Promise<void> {
    if (this.saving) return; this.saving = true; this.modalError='';
    try {
      const currentRow = this.editId ? this.data.find(x => x.id === this.editId) : undefined;
      const src = this.editSource || currentRow?.source || {};
      const problemaId = this.resolveId(this.editProblemaId, currentRow?.problemaId ?? this.toNumberOrUndefined(src.problemaId ?? src.ProblemaId, true), currentRow?.problema, this.problemaMap, true)
        ?? this.toNumberOrUndefined(src.problemaId ?? src.ProblemaId, true);
      const estadoId = this.resolveId(this.editEstadoId, currentRow?.estadoId ?? this.toNumberOrUndefined(src.estadoProblemaId ?? src.EstadoProblemaId, true), currentRow?.estado, this.estadoMap, true)
        ?? this.toNumberOrUndefined(src.estadoProblemaId ?? src.EstadoProblemaId, true);
      const medicoId = this.resolveId(this.editMedicoId, currentRow?.medicoId ?? this.toNumberOrUndefined(src.medicoId ?? src.MedicoId, true), currentRow?.medico, this.medicoMap, true)
        ?? this.toNumberOrUndefined(src.medicoId ?? src.MedicoId, true);

      const pacienteId = this.pacienteId || this.toNumberOrUndefined(src.pacienteId ?? src.PacienteId) || 0;
      if (!pacienteId) {
        throw new Error('No encontramos el identificador del paciente para actualizar la evolución');
      }

      const base: EvolucionInput = {
        descripcion: this.form.descripcion,
        fechaConsulta: this.fecha ? new Date(this.fecha).toISOString() : new Date().toISOString(),
        diagnosticoInicial: this.form.diagnosticoInicial || '',
        diagnosticoDefinitivo: this.form.diagnosticoDefinitivo,
        pacienteId,
        problemaId,
        estadoProblemaId: estadoId,
        medicoId
      };
      if (this.editId) {
        const original = { ...(this.editSource || {}), ...(currentRow?.source || {}) } as any;
        const request: EvolucionModel = {
          id: this.editId,
          descripcion: base.descripcion,
          fechaConsulta: new Date(base.fechaConsulta),
          diagnosticoInicial: base.diagnosticoInicial,
          diagnosticoDefinitivo: base.diagnosticoDefinitivo,
          pacienteId,
          pacienteNombre: original.pacienteNombre ?? original.PacienteNombre ?? '',
          plantillaId: this.toNumberOrUndefined(original.plantillaId ?? original.PlantillaId, true) ?? 0,
          plantillaNombre: original.plantillaNombre ?? original.PlantillaNombre,
          problemaId: problemaId ?? this.toNumberOrUndefined(original.problemaId ?? original.ProblemaId, true) ?? 0,
          problemaTitulo: original.problemaTitulo ?? original.ProblemaTitulo ?? currentRow?.problema,
          estadoProblemaId: estadoId ?? this.toNumberOrUndefined(original.estadoProblemaId ?? original.EstadoProblemaId, true) ?? 0,
          estadoProblemaNombre: original.estadoProblemaNombre ?? original.EstadoProblemaNombre ?? currentRow?.estado,
          medicoId: medicoId ?? this.toNumberOrUndefined(original.medicoId ?? original.MedicoId, true) ?? 0,
          medicoNombre: original.medicoNombre ?? original.MedicoNombre ?? currentRow?.medico
        };

        const resp = await firstValueFrom(this.evolucionSrv.editar(request));
        if (!resp?.estado) {
          throw new Error(resp?.mensaje || 'El servicio no confirmó la actualización');
        }
      } else {
        console.log('[Evoluciones] create payload', base);
        await firstValueFrom(this.evolucionesSrv.create(base));
      }
      this.page = 0;
      this.q='';
      this.modalOpen = false;
      this.loadEvoluciones();
      this.editId = null;
      this.form = { diagnosticoInicial: '' };
      this.editProblemaId = undefined;
      this.editEstadoId = undefined;
      this.editMedicoId = undefined;
      this.editSource = undefined;
    } catch (e:any) {
      this.modalError = e?.message || 'No pudimos guardar la evolución';
    } finally { this.saving = false; }
  }

  private mapRow(it: any): EvolucionRow {
    const rawProblemaId = it?.problemaId ?? it?.ProblemaId;
    const rawMedicoId = it?.medicoId ?? it?.MedicoId;
    const rawEstadoId = it?.estadoProblemaId ?? it?.EstadoProblemaId;
    const problemaId = Number(rawProblemaId);
    const medicoId = Number(rawMedicoId);
    const estadoId = Number(rawEstadoId);
    const problemaNombre = it?.problemaTitulo ?? it?.ProblemaTitulo ?? it?.problemaNombre ?? it?.ProblemaNombre ?? it?.problema ?? (Number.isFinite(problemaId) && problemaId > 0 ? this.problemaMap.get(problemaId) : undefined);
    const medicoNombre = it?.medicoNombre ?? it?.MedicoNombre ?? it?.medico ?? (Number.isFinite(medicoId) && medicoId > 0 ? this.medicoMap.get(medicoId) : undefined);
    const estadoNombre = it?.estadoProblemaNombre ?? it?.EstadoProblemaNombre ?? it?.estado ?? ((Number.isFinite(estadoId) && estadoId >= 0) ? this.estadoMap.get(estadoId) : undefined);
    return {
      id: it?.id ?? 0,
      problema: problemaNombre || '-',
      diagnosticoInicial: it?.diagnosticoInicial ?? it?.DiagnosticoInicial ?? '',
      diagnosticoFinal: it?.diagnosticoDefinitivo ?? it?.DiagnosticoDefinitivo ?? it?.diagnosticoFinal ?? '',
      medico: medicoNombre || '-',
      estado: estadoNombre || '-',
      fecha: it?.fechaConsulta ?? it?.FechaConsulta ?? it?.fecha,
      problemaId: Number.isFinite(problemaId) && problemaId > 0 ? problemaId : undefined,
      estadoId: Number.isFinite(estadoId) && estadoId >= 0 ? estadoId : undefined,
      medicoId: Number.isFinite(medicoId) && medicoId > 0 ? medicoId : undefined,
      source: it
    };
  }

  private ensureCatalogs() {
    if (this.catalogsLoaded) {
      return of(void 0);
    }
    return forkJoin({
      problemas: this.problemaSrv.lista().pipe(catchError(() => of({ estado: false, valor: [] }))),
      medicos: this.medicoSrv.lista().pipe(catchError(() => of({ estado: false, valor: [] }))),
      estados: this.estadoSrv.lista().pipe(catchError(() => of({ estado: false, valor: [] })))
    }).pipe(
      tap(({ problemas, medicos, estados }) => {
        this.populateProblemas(problemas);
        this.populateMedicos(medicos);
        this.populateEstados(estados);
      }),
      tap(() => { this.catalogsLoaded = true; }),
      rxMap(() => void 0)
    );
  }

  private resolveId(explicit?: number, current?: number, label?: string, map?: Map<number, string>, allowZero = false): number | undefined {
    if (explicit && explicit > 0) { return explicit; }
    if (current && (allowZero ? current >= 0 : current > 0)) { return current; }
    if (!label || !map) { return undefined; }
    const normalizedLabel = String(label).trim().toLowerCase();
    const match = Array.from(map.entries()).find(([_, value]) => String(value ?? '').trim().toLowerCase() === normalizedLabel);
    return match ? match[0] : undefined;
  }

  private toNumberOrUndefined(value: unknown, allowZero = false): number | undefined {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) { return undefined; }
    if (!allowZero && num <= 0) { return undefined; }
    if (allowZero && num < 0) { return undefined; }
    return num;
  }

  private populateProblemas(resp: any): void {
    const items: any[] = resp?.estado ? (resp.valor || []) : [];
    items.forEach(item => {
      const id = Number(item?.id ?? item?.Id);
      if (!Number.isFinite(id) || id <= 0) { return; }
      const titulo = item?.titulo ?? item?.Titulo ?? item?.nombre ?? item?.Nombre ?? '';
      if (titulo) { this.problemaMap.set(id, titulo); }
    });
  }

  private populateMedicos(resp: any): void {
    const items: any[] = resp?.estado ? (resp.valor || []) : [];
    items.forEach(item => {
      const id = Number(item?.id ?? item?.Id);
      if (!Number.isFinite(id) || id <= 0) { return; }
      const nombre = [
        item?.usuarioNombre ?? item?.UsuarioNombre ?? item?.nombre ?? item?.Nombre ?? '',
        item?.usuarioApellido ?? item?.UsuarioApellido ?? item?.apellido ?? item?.Apellido ?? ''
      ].filter(Boolean).join(' ').trim();
      const email = item?.usuarioMail ?? item?.UsuarioMail ?? '';
      const matricula = item?.matricula ?? item?.Matricula ?? '';
      const display = nombre || email || matricula || `Medico ${id}`;
      this.medicoMap.set(id, display);
    });
  }

  private populateEstados(resp: any): void {
    const items: any[] = resp?.estado ? (resp.valor || []) : [];
    this.estadoOptions = items
      .map(item => {
        const id = Number(item?.id ?? item?.Id);
        if (!Number.isFinite(id) || id < 0) { return null; }
        const nombre = this.toDisplayName(item?.nombre ?? item?.Nombre ?? item?.titulo ?? item?.Titulo);
        if (!nombre) { return null; }
        this.estadoMap.set(id, nombre);
        return { id, nombre };
      })
      .filter((v): v is { id: number; nombre: string } => !!v);
    // Ordenamos con el valor 0 (ej. "Nuevo") primero si existe.
    this.estadoOptions.sort((a, b) => a.id - b.id);
  }

  private toDisplayName(value: unknown): string | undefined {
    if (value === null || value === undefined) { return undefined; }
    const text = String(value).trim();
    return text.length > 0 ? text : undefined;
  }
}
