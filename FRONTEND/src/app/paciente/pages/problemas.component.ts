import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { EvolucionService } from '../../services/evolucion.service';
import { Evolucion } from '../../interfaces/evolucion';
import { ProblemaService } from '../../services/problema.service';
import { MedicoService } from '../../services/medico.service';
import { EstadoProblemaService } from '../../services/estado-problema.service';

interface ProblemaRow {
  id: number;
  titulo: string;
  estadoNombre?: string;
  inicio?: string;
  profesional?: string;
  tipo?: string;
}
interface ProblemaMeta {
  titulo?: string;
  estadoNombre?: string;
  estadoId?: number;
  fechaInicio?: string;
  medicoId?: number;
  medicoNombre?: string;
  tipoNombre?: string;
}

@Component({
  standalone: true,
  selector: 'app-paciente-problemas',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card card-problemas">
      <h3 class="h3">Problema</h3>
      <div class="toolbar">
       <button class="btn" type="button" (click)="nuevo()">
  <span>Nuevo Problema</span>
  <span class="material-icons">add_circle</span>
</button>
        <input [(ngModel)]="q" placeholder="Buscar..." />
      </div>

      <div *ngIf="loading" class="status">Cargando problemas...</div>
      <div *ngIf="error" class="status error">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Inicio</th>
                <th>Medico</th>
                <th>Estado</th>
                <th>Evoluciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pageItems()">
                <td>{{ p.titulo }}</td>
                <td>{{ p.inicio || '-' }}</td>
                <td>{{ p.profesional || '-' }}</td>
                <td>{{ p.estadoNombre || '-' }}</td>
                <td>
                  <a (click)="verEvoluciones()" title="Ver" class="link">Ver</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pager">
          <div class="page-size">
            <small>Items per page:</small>
            <select [(ngModel)]="pageSize">
              <option [ngValue]="5">5</option>
              <option [ngValue]="10">10</option>
            </select>
          </div>
          <div class="page-nav">
            <small>{{ rangeLabel() }}</small>
            <button class="btn-outline" (click)="prev()" [disabled]="page===0"><</button>
            <button class="btn-outline" (click)="next()" [disabled]="(page+1)>=pagesCount()">></button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .card-problemas{
      margin-bottom:12px;
      display:flex;
      flex-direction:column;
      gap:16px;
    }
    .toolbar{
      display:flex;
      gap:12px;
      align-items:center;
    }
    .toolbar input{
      flex:1;
      border:1px solid var(--line);
      border-radius:6px;
      padding:8px 12px;
    }
    .status{
      font-size:14px;
      color:#4b5563;
    }
    .status.error{
      color:#d63031;
    }
    .link{
      cursor:pointer;
      color:#4b5563;
      text-decoration:underline;
    }
    .pager{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:auto;
      gap:16px;
      flex-wrap:wrap;
    }
    .page-size, .page-nav{
      display:flex;
      align-items:center;
      gap:10px;
    }
    select{
      border:1px solid var(--line);
      border-radius:6px;
      padding:6px 10px;
    }
      .btn{
  display: inline-flex;
  align-items: center;   /* centra verticalmente texto + icono */
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
}
.material-icons{
  font-size: 20px;       /* ajustá al tamaño que uses */
  line-height: 1;        /* evita desalineo por altura de línea */
}
  /* Rayado de filas: una blanca, una gris */
.table tbody tr:nth-child(odd)  { background: #ffffff; }
.table tbody tr:nth-child(even) { background: #f5f6f8; }


  `]
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
  private problemaMeta = new Map<number, ProblemaMeta>();
  private medicoMap = new Map<number, string>();
  private estadoMap = new Map<number, string>();
  private medicosLoaded = false;
  private estadosLoaded = false;
  private medicosLoading = false;
  private estadosLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evolucionSrv: EvolucionService,
    private problemaSrv: ProblemaService,
    private medicoSrv: MedicoService,
    private estadoSrv: EstadoProblemaService
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
    this.ensureMedicos();
    this.ensureEstados();
    // Cargar catálogo (para mapear id -> título) y luego las evoluciones
    this.titulos.clear();
    this.problemaMeta.clear();
    this.problemaSrv.lista().subscribe({
      next: (resp:any) => {
        const items: any[] = resp?.estado ? (resp.valor || []) : [];
        try {
          items.forEach((p:any) => {
            const id = Number(p?.id ?? p?.Id);
            if (!Number.isFinite(id) || id <= 0) { return; }
            const titulo = p?.titulo ?? p?.Titulo ?? '';
            const estadoId = Number(p?.estadoProblemaId ?? p?.EstadoProblemaId ?? p?.estado?.id ?? p?.Estado?.Id);
            const estadoNombre = this.pickString(p, ['estadoProblemaNombre','EstadoProblemaNombre','estadoNombre','EstadoNombre','problemaEstadoNombre','ProblemaEstadoNombre','estado','Estado'], ['estadoProblema','EstadoProblema','estado'], 'nombre');
            const fechaInicio = p?.fechaInicio ?? p?.FechaInicio ?? p?.inicio ?? p?.Inicio;
            const medicoIdRaw = p?.medicoId ?? p?.MedicoId;
            const parsedMedicoId = Number(medicoIdRaw);
            const medicoId = Number.isFinite(parsedMedicoId) && parsedMedicoId > 0 ? parsedMedicoId : undefined;
            const medicoNombre = p?.medicoNombre ?? p?.MedicoNombre ?? p?.medico ?? p?.Medico;
            this.problemaMeta.set(id, {
              titulo,
              estadoNombre,
              estadoId: Number.isFinite(estadoId) && estadoId >= 0 ? estadoId : undefined,
              fechaInicio,
              medicoId,
              medicoNombre
            });
            if (titulo) {
              this.titulos.set(id, titulo);
            }
            if (Number.isFinite(estadoId) && estadoId >= 0 && estadoNombre) {
              this.estadoMap.set(estadoId, estadoNombre);
            }
          });
        } catch {}
      },
      complete: () => this.loadEvoluciones(),
      error: () => this.loadEvoluciones()
    });
  }

  private loadEvoluciones(){
    this.evolucionSrv.listaPorPaciente(this.pacienteId).subscribe({
      next: (resp:any) => {
        const raw: any[] = resp?.estado ? (resp.valor || []) : [];
        raw.forEach(it => this.mergeMetaFromEvolution(it));
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
          estadoProblemaId: it.estadoProblemaId ?? it.EstadoProblemaId ?? it.estado?.id ?? it.Estado?.Id,
          estadoProblemaNombre: it.estadoProblemaNombre ?? it.EstadoProblemaNombre ?? it.estado?.nombre ?? it.Estado?.Nombre ?? it.estado ?? it.Estado,
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
          this.data = Array.from(byTitle.entries()).map(([titulo, arr], idx) =>
            this.buildRow(arr, { key: -1, fallbackId: idx + 1, fallbackTitulo: titulo, useMeta: false })
          );
        } else {
          this.data = Array.from(byId.entries())
            .filter(([k]) => k > 0)
            .map(([key, arr]) => this.buildRow(arr, { key, fallbackTitulo: this.titulos.get(key) || '-' }));
        }
        this.loading=false; this.page=0;
      },
      error: () => { this.loading=false; this.error='No pudimos cargar problemas del paciente'; }
    });
  }

  private mergeMetaFromEvolution(it: any): void {
    const key = Number(it?.problemaId ?? it?.ProblemaId ?? 0);
    if (!Number.isFinite(key) || key <= 0) { return; }
    const current = this.problemaMeta.get(key) || {};
    const titulo = this.pickString(it, ['problemaTitulo','ProblemaTitulo','problemaNombre','ProblemaNombre','problema','Problema']);
    if (titulo && !current.titulo) {
      current.titulo = titulo;
      this.titulos.set(key, titulo);
    }
    const estadoId = Number(it?.estadoProblemaId ?? it?.EstadoProblemaId ?? it?.estado?.id ?? it?.Estado?.Id);
    const estado = this.pickString(it, ['estadoProblemaNombre','EstadoProblemaNombre','estadoNombre','EstadoNombre','problemaEstadoNombre','ProblemaEstadoNombre','estado','Estado'], ['estadoProblema','EstadoProblema','problemaEstado','ProblemaEstado','estado'], 'nombre');
    if (estado && !current.estadoNombre) {
      current.estadoNombre = estado;
    }
    if (!current.estadoId && Number.isFinite(estadoId) && estadoId >= 0) {
      current.estadoId = estadoId;
    }
    if (Number.isFinite(estadoId) && estadoId >= 0 && estado) {
      this.estadoMap.set(estadoId, estado);
    }
    const fechaInicio = it?.fechaInicio ?? it?.FechaInicio ?? it?.inicio ?? it?.Inicio ?? it?.fechaConsulta ?? it?.FechaConsulta;
    if (fechaInicio && !current.fechaInicio) {
      current.fechaInicio = fechaInicio;
    }
    const medicoNombre = this.pickString(it, ['medicoNombre','MedicoNombre','medico','Medico'], ['medico','Medico'], 'nombre');
    if (medicoNombre && !current.medicoNombre) {
      current.medicoNombre = medicoNombre;
    }
    const medicoId = Number(it?.medicoId ?? it?.MedicoId);
    if (Number.isFinite(medicoId) && medicoId > 0 && !current.medicoId) {
      current.medicoId = medicoId;
    }
    this.problemaMeta.set(key, current);
  }

  private buildRow(evols: Evolucion[], opts: { key: number; fallbackId?: number; fallbackTitulo?: string; useMeta?: boolean }): ProblemaRow {
    const { key, fallbackId, fallbackTitulo } = opts;
    const meta = opts.useMeta === false || key <= 0 ? undefined : this.problemaMeta.get(key);
    const sorted = evols.slice().sort((a, b) => this.dateValue(b.fechaConsulta) - this.dateValue(a.fechaConsulta));
    const latest = sorted[0];
    const titulo = (meta?.titulo || latest?.problemaTitulo || fallbackTitulo || '-').trim();
    const estado = meta?.estadoNombre
      || this.normalizeString(latest?.estadoProblemaNombre)
      || (meta?.estadoId ? this.estadoMap.get(meta.estadoId) : undefined)
      || (Number.isFinite(latest?.estadoProblemaId as any) ? this.estadoMap.get(Number(latest?.estadoProblemaId)) : undefined)
      || this.firstNonEmpty(sorted, e => this.pickString(e, ['estadoProblemaNombre','EstadoProblemaNombre','problemaEstadoNombre','ProblemaEstadoNombre','estadoNombre','EstadoNombre','estado','Estado'], ['estadoProblema','EstadoProblema','problemaEstado','ProblemaEstado','estadoProblema','estado'], 'nombre'))
      || undefined;
    const medicoIdFromMeta = typeof meta?.medicoId === 'number' && meta.medicoId > 0 ? meta.medicoId : undefined;
    const medicoIdFromEvoRaw = latest ? (latest.medicoId ?? (latest as any)?.MedicoId) : undefined;
    const medicoIdFromEvo = Number(medicoIdFromEvoRaw);
    const medicoIdValid = Number.isFinite(medicoIdFromEvo) && medicoIdFromEvo > 0 ? medicoIdFromEvo : undefined;
    const nestedMedico = latest ? ((latest as any)?.medico ?? (latest as any)?.Medico ?? (latest as any)?.medicoInfo ?? (latest as any)?.MedicoInfo) : undefined;
    let profesional = this.normalizeString(meta?.medicoNombre)
      || (medicoIdFromMeta ? this.normalizeString(this.medicoMap.get(medicoIdFromMeta)) : undefined)
      || (medicoIdValid ? this.normalizeString(this.medicoMap.get(medicoIdValid)) : undefined)
      || this.normalizeString(this.extractNombreCompleto(nestedMedico))
      || this.normalizeString(latest?.medicoNombre)
      || this.normalizeString(this.firstNonEmpty(sorted, e => this.pickString(e, ['medicoNombre','MedicoNombre','medico','Medico'], ['medico','Medico','profesional','Profesional'], 'nombre')))
      || (medicoIdValid ? `Medico ${medicoIdValid}` : undefined);
    if (profesional && profesional.includes('@')) {
      profesional = medicoIdValid ? `Medico ${medicoIdValid}` : undefined;
    }
    const inicioDate = meta?.fechaInicio ? this.parseDate(meta.fechaInicio) : this.findEarliestDate(evols);
    const inicio = inicioDate ? this.formatDate(inicioDate) : undefined;
    const id = key > 0 ? key : (fallbackId ?? key);
    return {
      id,
      titulo,
      estadoNombre: estado,
      inicio,
      profesional: profesional || undefined
    };
  }

  private dateValue(value: unknown): number {
    const d = this.parseDate(value);
    return d ? d.getTime() : 0;
  }

  private parseDate(value: unknown): Date | null {
    if (!value) { return null; }
    if (value instanceof Date) { return Number.isNaN(value.getTime()) ? null : value; }
    const d = new Date(value as any);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private findEarliestDate(evols: Evolucion[]): Date | null {
    let earliest: Date | null = null;
    evols.forEach(e => {
      const d = this.parseDate(e.fechaConsulta);
      if (d && (!earliest || d.getTime() < earliest.getTime())) {
        earliest = d;
      }
    });
    return earliest;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-AR');
  }

  private firstNonEmpty(arr: Evolucion[], selector: (e: Evolucion) => unknown): string | undefined {
    for (const item of arr) {
      const value = selector(item);
      if (value === null || value === undefined) { continue; }
      const text = String(value).trim();
      if (text.length > 0) {
        return text;
      }
    }
    return undefined;
  }

  private pickString(source: any, directKeys: string[], nestedKeys: string[] = [], nestedField: string = 'nombre'): string | undefined {
    if (!source) { return undefined; }
    for (const key of directKeys) {
      const value = source?.[key];
      if (value === null || value === undefined) { continue; }
      const text = String(value).trim();
      if (text.length > 0) { return text; }
    }
    for (const key of nestedKeys) {
      const nested = source?.[key];
      if (!nested) { continue; }
      const value = nested?.[nestedField] ?? nested?.Nombre ?? nested?.nombre;
      if (value === null || value === undefined) { continue; }
      const text = String(value).trim();
      if (text.length > 0) { return text; }
    }
    return undefined;
  }

  private normalizeString(value: unknown): string | undefined {
    if (value === null || value === undefined) { return undefined; }
    const text = String(value).trim();
    if (!text) { return undefined; }
    const invalid = ['string', 'null', 'undefined'];
    if (invalid.includes(text.toLowerCase())) { return undefined; }
    return text;
  }

  private extractNombreCompleto(source: any): string | undefined {
    if (!source) { return undefined; }
    const partes = [
      this.normalizeString(source?.nombre ?? source?.Nombre ?? source?.usuarioNombre ?? source?.UsuarioNombre ?? source?.personaNombre ?? source?.PersonaNombre),
      this.normalizeString(source?.apellido ?? source?.Apellido ?? source?.usuarioApellido ?? source?.UsuarioApellido ?? source?.personaApellido ?? source?.PersonaApellido)
    ].filter((v): v is string => !!v);
    if (partes.length) {
      return partes.join(' ').trim();
    }
    const compuesto = this.normalizeString(source?.nombreCompleto ?? source?.NombreCompleto ?? source?.displayName ?? source?.DisplayName);
    return compuesto || undefined;
  }

  filtradas(): ProblemaRow[] {
    const term = this.q.toLowerCase();
    return this.data.filter(p => `${p.titulo} ${p.estadoNombre || ''} ${p.inicio || ''} ${p.profesional || ''}`.toLowerCase().includes(term));
  }
  pagesCount(): number { return Math.max(1, Math.ceil(this.filtradas().length / this.pageSize)); }
  pageItems(): ProblemaRow[] { const s = this.page * this.pageSize; return this.filtradas().slice(s, s + this.pageSize); }
  rangeLabel(): string { const t = this.filtradas().length; const s = t ? this.page * this.pageSize + 1 : 0; const e = Math.min(t, (this.page + 1) * this.pageSize); return `${s} - ${e} of ${t}`; }
  prev(): void { if (this.page>0) this.page--; }
  next(): void { if ((this.page+1) < this.pagesCount()) this.page++; }

  nuevo(): void { this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'problemas', 'nuevo']); }
  verEvoluciones(): void { this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'evoluciones']); }

  private ensureMedicos(): void {
    if (this.medicosLoaded || this.medicosLoading) { return; }
    this.medicosLoading = true;
    this.medicoSrv.lista().subscribe({
      next: (resp:any) => {
        const items: any[] = resp?.estado ? (resp.valor || []) : [];
        items.forEach(item => {
          const id = Number(item?.id ?? item?.Id);
          if (!Number.isFinite(id) || id <= 0) { return; }
          const nombre = this.normalizeString(this.extractNombreCompleto(item) ?? this.extractNombreCompleto(item?.usuario ?? item?.Usuario));
          const matricula = this.normalizeString(item?.matricula ?? item?.Matricula);
          const display = nombre || matricula || `Medico ${id}`;
          this.medicoMap.set(id, display);
        });
        this.medicosLoaded = true;
      },
      error: () => { this.medicosLoading = false; },
      complete: () => { this.medicosLoading = false; }
    });
  }

  private ensureEstados(): void {
    if (this.estadosLoaded || this.estadosLoading) { return; }
    this.estadosLoading = true;
    this.estadoSrv.lista().subscribe({
      next: (resp:any) => {
        const items: any[] = resp?.estado ? (resp.valor || []) : [];
        items.forEach(item => {
          const id = Number(item?.id ?? item?.Id);
          if (!Number.isFinite(id) || id < 0) { return; }
          const nombre = this.normalizeString(item?.nombre ?? item?.Nombre ?? item?.titulo ?? item?.Titulo);
          if (nombre) {
            this.estadoMap.set(id, nombre);
          }
        });
        this.estadosLoaded = true;
      },
      error: () => { this.estadosLoading = false; },
      complete: () => { this.estadosLoading = false; }
    });
  }


}
