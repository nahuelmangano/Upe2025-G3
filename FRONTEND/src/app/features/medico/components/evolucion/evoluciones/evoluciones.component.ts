import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map as rxMap, tap } from 'rxjs/operators';
import { EvolucionesService, EvolucionInput } from '@features/paciente/services/evoluciones.service';
import { EvolucionService } from '@features/paciente/services/evolucion.service';
import { EstudioService } from '@features/estudio/services/estudio.service';
import { ArchivoAdjuntoService } from '@features/paciente/services/archivo-adjunto.service';
import { Evolucion as EvolucionModel } from '@features/paciente/interfaces/evolucion';
import { ProblemaService } from '@features/paciente/services/problema.service';
import { MedicoService } from '@features/medico/services/medico.service';
import { EstadoProblemaService } from '@features/medico/services/estado-problema.service';
import { CampoValorService } from '@features/medico/services/campo-valor.service';
import { CampoService } from '@features/medico/services/campo.service';

interface EvolucionRow {
  id: number;
  problema: string;
  diagnosticoInicial: string;
  diagnosticoFinal?: string;
  medico: string;
  estado: string;
  fecha?: string;
  fechaTexto?: string;
  descripcion?: string | null;
  problemaId?: number;
  estadoId?: number;
  medicoId?: number;
  plantillaId?: number | null;
  plantillaNombre?: string;
  tienePlanilla?: boolean;
  planillaCampos?: PlanillaCampo[];
  planillaLoaded?: boolean;
  planillaLoading?: boolean;
  planillaError?: string;
  mostrarPlanilla?: boolean;
  source?: any;
}

interface PlanillaCampo {
  id: number;
  campoId: number;
  etiqueta: string;
  valor: string;
  tipo?: 'text' | 'textarea' | 'checkbox' | 'number';
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
  templateUrl: './evoluciones.component.html',
  styleUrls: ['./evoluciones.component.css']
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
  editPlanillaCampos: PlanillaCampo[] = [];
  editPlanillaLoading = false;
  editPlanillaError = '';
  editTienePlanilla = false;
  editPlanillaNombre = '';

  constructor(
    private route: ActivatedRoute,
    private evolucionesSrv: EvolucionesService,
    private evolucionSrv: EvolucionService,
    private estudioSrv: EstudioService,
    private archivoSrv: ArchivoAdjuntoService,
    private problemaSrv: ProblemaService,
    private medicoSrv: MedicoService,
    private estadoSrv: EstadoProblemaService,
    private campoValorSrv: CampoValorService,
    private campoSrv: CampoService,
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
          this.data = items
            .map(it => this.mapRow(it))
            .sort((a, b) => this.fechaTimestamp(b.fecha) - this.fechaTimestamp(a.fecha));
          this.loading=false; this.page=0;
        },
      error: () => { this.loading=false; this.error='No pudimos cargar evoluciones'; }
    });
  }

    filtradas(): EvolucionRow[] {
      const term = this.q.toLowerCase();
      return this.data.filter(e => `${e.problema} ${e.diagnosticoInicial} ${e.diagnosticoFinal} ${e.medico} ${e.estado} ${e.fechaTexto ?? ''}`.toLowerCase().includes(term));
    }
  pagesCount(): number { return Math.max(1, Math.ceil(this.filtradas().length / this.pageSize)); }
  pageItems(): EvolucionRow[] { const s = this.page * this.pageSize; return this.filtradas().slice(s, s + this.pageSize); }
  rangeLabel(): string { const t = this.filtradas().length; const s = t ? this.page * this.pageSize + 1 : 0; const e = Math.min(t, (this.page + 1) * this.pageSize); return `${s} - ${e} of ${t}`; }
  prev(): void { if (this.page>0) this.page--; }
  next(): void { if ((this.page+1) < this.pagesCount()) this.page++; }

  openModal(): void { this.router.navigate(['/medico', 'paciente', this.pacienteId, 'evoluciones', 'nueva']); }
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
    const descripcion = e.descripcion ?? src.descripcion ?? src.Descripcion ?? '';
    this.form = {
      diagnosticoInicial: e.diagnosticoInicial,
      diagnosticoDefinitivo: e.diagnosticoFinal,
      descripcion
    };
    const plantillaId = this.toNumberOrUndefined(e.plantillaId ?? src.plantillaId ?? src.PlantillaId, true);
    this.editTienePlanilla = !!(e.tienePlanilla || (typeof plantillaId === 'number' && plantillaId > 0));
    this.editPlanillaNombre = e.plantillaNombre || src.plantillaNombre || src.PlantillaNombre || '';
    this.editPlanillaCampos = [];
    this.editPlanillaError = '';
    this.editPlanillaLoading = false;
    if (this.editTienePlanilla) {
      this.loadPlanillaForEdit(e);
    }
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
    this.resetEditPlanillaState();
  }

  togglePlanilla(row: EvolucionRow): void {
    if (!row.tienePlanilla) {
      return;
    }
    row.mostrarPlanilla = !row.mostrarPlanilla;
    if (row.mostrarPlanilla && !row.planillaLoaded && !row.planillaLoading) {
      this.loadPlanilla(row);
    }
  }

  formatPlanillaValor(valor: string | null | undefined): string {
    if (valor === null || valor === undefined) {
      return '—';
    }
    const normalized = valor.toString().trim();
    if (!normalized) {
      return '—';
    }
    const lower = normalized.toLowerCase();
    if (lower === 'true') {
      return 'Sí';
    }
    if (lower === 'false') {
      return 'No';
    }
    if (normalized.includes(',')) {
      return normalized
        .split(',')
        .map(fragment => fragment.trim())
        .filter(Boolean)
        .join('\n');
    }
    return normalized;
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
        const plantillaIdOriginal = this.toNumberOrUndefined(original.plantillaId ?? original.PlantillaId, true);
        const plantillaIdValue = typeof plantillaIdOriginal === 'number' && plantillaIdOriginal > 0 ? plantillaIdOriginal : null;
        const request: EvolucionModel = {
          id: this.editId,
          descripcion: base.descripcion,
          fechaConsulta: new Date(base.fechaConsulta),
          diagnosticoInicial: base.diagnosticoInicial,
          diagnosticoDefinitivo: base.diagnosticoDefinitivo,
          pacienteId,
          pacienteNombre: original.pacienteNombre ?? original.PacienteNombre ?? '',
          plantillaId: plantillaIdValue,
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
        if (this.editTienePlanilla && this.editPlanillaCampos.length) {
          await this.savePlanillaValores(this.editId);
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
      this.resetEditPlanillaState();
    } catch (e:any) {
      this.modalError = e?.message || 'No pudimos guardar la evolución';
    } finally { this.saving = false; }
  }

  private loadPlanilla(row: EvolucionRow): void {
    row.planillaLoading = true;
    row.planillaError = '';
    this.fetchPlanillaValores(row)
      .then(campos => {
        row.planillaLoading = false;
        row.planillaCampos = campos;
        row.planillaLoaded = true;
      })
      .catch(err => {
        console.error('No se pudieron cargar los datos de la planilla', err);
        row.planillaLoading = false;
        row.planillaError = 'No se pudieron cargar los datos de la planilla.';
        row.planillaCampos = [];
        row.planillaLoaded = true;
      });
  }

  private async fetchPlanillaValores(row: EvolucionRow): Promise<PlanillaCampo[]> {
    try {
      const resp = await firstValueFrom(this.campoValorSrv.listaPorEvolucion(row.id));
      const estadoOk = resp?.estado ?? (resp as any)?.Estado;
      if (!estadoOk) {
        throw new Error(resp?.mensaje ?? (resp as any)?.Mensaje ?? 'El servicio devolvió un estado inválido.');
      }
      const rawLista = resp?.valor ?? (resp as any)?.Valor ?? [];
      const items: any[] = Array.isArray(rawLista) ? rawLista : [];
      if (!items.length) {
        return [];
      }
      return items
        .map(item => this.toPlanillaCampoFromDto(item))
        .filter((campo): campo is PlanillaCampo => !!campo);
    } catch (err) {
      if (!row.plantillaId) {
        throw err;
      }
      return this.fetchPlanillaValoresFallback(row);
    }
  }

  private async fetchPlanillaValoresFallback(row: EvolucionRow): Promise<PlanillaCampo[]> {
    if (!row.plantillaId) {
      return [];
    }
    const camposResp = await firstValueFrom(this.campoSrv.lista(row.plantillaId));
    const camposRaw: any[] = camposResp?.estado ? (camposResp.valor || []) : [];
    const camposActivos = camposRaw
      .filter(campo => campo && (campo.activo === 1 || campo.activo === true))
      .filter(campo => {
        const tipoId = Number(campo?.tipoCampoId ?? campo?.TipoCampoId ?? 0);
        return tipoId !== 1002;
      })
      .sort((a, b) => (a?.orden ?? 0) - (b?.orden ?? 0));

    if (!camposActivos.length) {
      return [];
    }

    const valores = await Promise.all(
      camposActivos.map(async campo => {
        try {
          const resp = await firstValueFrom(this.campoValorSrv.listaPorCampoEvolucion(Number(campo.id ?? campo.Id), row.id));
          const estadoOk = resp?.estado ?? (resp as any)?.Estado;
          if (!estadoOk) {
            return null;
          }
          const registros: any[] = Array.isArray(resp?.valor) ? resp.valor : Array.isArray((resp as any)?.Valor) ? (resp as any).Valor : [];
          if (!registros.length) {
            return null;
          }
          const dto = registros[0];
          return this.toPlanillaCampoFromDto(dto, campo);
        } catch {
          return null;
        }
      })
    );

    return valores.filter((campo): campo is PlanillaCampo => !!campo);
  }

  private toPlanillaCampoFromDto(dto: any, campoInfo?: any): PlanillaCampo | null {
    if (!dto) {
      return null;
    }
    const campoId = Number(dto?.campoId ?? dto?.CampoId ?? campoInfo?.id ?? campoInfo?.Id ?? 0);
    const etiqueta =
      dto?.campoEtiqueta ??
      dto?.CampoEtiqueta ??
      campoInfo?.etiqueta ??
      campoInfo?.Etiqueta ??
      (campoId ? `Campo ${campoId}` : 'Campo');
    const rawValor = dto?.valor ?? dto?.Valor;
    let tipo = this.detectCampoTipo(campoInfo, dto, rawValor);
    const valorNormalizado = this.normalizeCampoValor(rawValor, tipo);
    if (tipo === 'text' && (valorNormalizado === 'true' || valorNormalizado === 'false')) {
      tipo = 'checkbox';
    }
    return {
      id: Number(dto?.id ?? dto?.Id ?? campoId) || 0,
      campoId,
      etiqueta,
      valor: valorNormalizado,
      tipo
    };
  }

  private detectCampoTipo(campoInfo?: any, dto?: any, valor?: any): 'text' | 'textarea' | 'checkbox' | 'number' {
    const tipoEntrada = (
      campoInfo?.tipoEntrada ??
      campoInfo?.TipoEntrada ??
      campoInfo?.tipoCampoNombre ??
      campoInfo?.TipoCampoNombre ??
      campoInfo?.tipoCampo ??
      dto?.tipoEntrada ??
      dto?.TipoEntrada ??
      dto?.campoTipoEntrada ??
      dto?.CampoTipoEntrada ??
      dto?.tipoCampoNombre ??
      dto?.TipoCampoNombre ??
      dto?.tipoCampo ??
      ''
    ).toString().toLowerCase();
    if (tipoEntrada.includes('checkbox')) return 'checkbox';
    if (tipoEntrada.includes('textarea')) return 'textarea';
    if (tipoEntrada.includes('number') || tipoEntrada.includes('decimal')) return 'number';
    if (valor === true || valor === false) return 'checkbox';
    if (typeof valor === 'string') {
      const trimmed = valor.trim().toLowerCase();
      if (trimmed === 'true' || trimmed === 'false') { return 'checkbox'; }
    }
    return 'text';
  }

  private normalizeCampoValor(valor: any, tipo: 'text' | 'textarea' | 'checkbox' | 'number'): string {
    if (tipo === 'checkbox') {
      return (valor === true || valor === 'true' || valor === 1 || valor === '1') ? 'true' : 'false';
    }
    if (valor === null || valor === undefined) return '';
    if (Array.isArray(valor)) return valor.join(', ');
    if (typeof valor === 'string') {
      const trimmed = valor.trim().toLowerCase();
      if (trimmed === 'true' || trimmed === 'false') {
        return trimmed === 'true' ? 'true' : 'false';
      }
    }
    return Array.isArray(valor) ? valor.join(', ') : valor.toString();
  }

  private mapRow(it: any): EvolucionRow {
    const rawProblemaId = it?.problemaId ?? it?.ProblemaId;
    const rawMedicoId = it?.medicoId ?? it?.MedicoId;
    const rawEstadoId = it?.estadoProblemaId ?? it?.EstadoProblemaId;
    const problemaId = Number(rawProblemaId);
    const medicoId = Number(rawMedicoId);
    const estadoId = Number(rawEstadoId);
    const rawPlantillaId = it?.plantillaId ?? it?.PlantillaId;
    const plantillaId = this.toNumberOrUndefined(rawPlantillaId);
    const plantillaNombre = this.sanitizeLabel(it?.plantillaNombre ?? it?.PlantillaNombre) ??
      (typeof plantillaId === 'number' && plantillaId > 0 ? `Plantilla ${plantillaId}` : undefined);
    const tienePlanilla = typeof plantillaId === 'number' && plantillaId > 0;

    const problemaNombre = this.sanitizeLabel(
      it?.problemaTitulo ?? it?.ProblemaTitulo ?? it?.problemaNombre ?? it?.ProblemaNombre ?? it?.problema
    ) ?? (Number.isFinite(problemaId) && problemaId > 0 ? this.problemaMap.get(problemaId) : undefined);
    const medicoNombre = this.resolveMedicoNombre(medicoId, it);
    const estadoNombre = this.sanitizeLabel(it?.estadoProblemaNombre ?? it?.EstadoProblemaNombre ?? it?.estado) ??
      ((Number.isFinite(estadoId) && estadoId >= 0) ? this.estadoMap.get(estadoId) : undefined);

    const fechaIso = this.normalizeFechaValue(it?.fechaConsulta ?? it?.FechaConsulta ?? it?.fecha ?? it?.Fecha);

    return {
      id: it?.id ?? 0,
      problema: problemaNombre || '-',
      diagnosticoInicial: it?.diagnosticoInicial ?? it?.DiagnosticoInicial ?? '',
      diagnosticoFinal: it?.diagnosticoDefinitivo ?? it?.DiagnosticoDefinitivo ?? it?.diagnosticoFinal ?? '',
      medico: medicoNombre || '-',
      estado: estadoNombre || '-',
      fecha: fechaIso,
      fechaTexto: fechaIso ? this.formatFechaDisplay(fechaIso) : undefined,
      descripcion: it?.descripcion ?? it?.Descripcion ?? '',
      problemaId: Number.isFinite(problemaId) && problemaId > 0 ? problemaId : undefined,
      estadoId: Number.isFinite(estadoId) && estadoId >= 0 ? estadoId : undefined,
      medicoId: Number.isFinite(medicoId) && medicoId > 0 ? medicoId : undefined,
      plantillaId: typeof plantillaId === 'number' ? plantillaId : null,
      plantillaNombre: tienePlanilla ? plantillaNombre : undefined,
      tienePlanilla,
      planillaCampos: undefined,
      planillaLoaded: false,
      planillaLoading: false,
      planillaError: '',
      mostrarPlanilla: false,
      source: it
    };
  }

  private loadPlanillaForEdit(row: EvolucionRow): void {
    this.editPlanillaLoading = true;
    this.editPlanillaError = '';
    const loadPromise = row.planillaLoaded
      ? Promise.resolve(row.planillaCampos ?? [])
      : this.fetchPlanillaValores(row).then(campos => {
          row.planillaCampos = campos;
          row.planillaLoaded = true;
          row.planillaError = '';
          return campos;
        });
    loadPromise
      .then(campos => {
        this.editPlanillaCampos = (campos || []).map(c => ({ ...c }));
        this.editPlanillaLoading = false;
      })
      .catch(() => {
        this.editPlanillaError = 'No pudimos cargar los datos de la planilla.';
        this.editPlanillaLoading = false;
      });
  }

  private async savePlanillaValores(evolucionId: number): Promise<void> {
    if (!this.editPlanillaCampos.length) { return; }
    for (const campo of this.editPlanillaCampos) {
      const payload = {
        id: campo.id ?? 0,
        campoId: campo.campoId,
        evolucionId,
        valor: campo.valor ?? ''
      };
      if (payload.id && payload.id > 0) {
        const resp = await firstValueFrom(this.campoValorSrv.editar(payload));
        if (!resp?.estado) {
          throw new Error(resp?.mensaje || 'No se pudieron actualizar los valores de la planilla');
        }
      } else {
        const resp = await firstValueFrom(this.campoValorSrv.crear(payload));
        if (!resp?.estado) {
          throw new Error(resp?.mensaje || 'No se pudieron guardar algunos valores de la planilla');
        }
      }
    }
  }

  private resetEditPlanillaState(): void {
    this.editPlanillaCampos = [];
    this.editPlanillaLoading = false;
    this.editPlanillaError = '';
    this.editTienePlanilla = false;
    this.editPlanillaNombre = '';
  }

  onCheckboxCampoChange(campo: PlanillaCampo, event: Event): void {
    const input = event.target as HTMLInputElement;
    campo.valor = input.checked ? 'true' : 'false';
  }

  private normalizeFechaValue(value: any): string | undefined {
    if (!value) { return undefined; }
    const date = value instanceof Date ? value : new Date(value);
    const time = date.getTime();
    if (!Number.isFinite(time)) { return undefined; }
    return date.toISOString();
  }

  private fechaTimestamp(fecha?: string): number {
    if (!fecha) { return 0; }
    const time = Date.parse(fecha);
    return Number.isFinite(time) ? time : 0;
  }

  private formatFechaDisplay(fechaIso: string): string {
    const time = Date.parse(fechaIso);
    if (!Number.isFinite(time)) { return ''; }
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(time));
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
      const nombre = this.buildNombreCompleto(item)
        ?? this.buildNombreCompleto(item?.usuario ?? item?.Usuario)
        ?? this.buildNombreCompleto(item?.persona ?? item?.Persona);
      const email = this.sanitizeLabel(item?.usuarioMail ?? item?.UsuarioMail);
      const matricula = this.sanitizeLabel(item?.matricula ?? item?.Matricula);
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

  private sanitizeLabel(value: unknown): string | undefined {
    if (value === null || value === undefined) { return undefined; }
    const text = String(value).trim();
    if (!text) { return undefined; }
    const invalid = ['string', 'null', 'undefined'];
    if (invalid.includes(text.toLowerCase())) { return undefined; }
    return text;
  }

  private resolveMedicoNombre(medicoId: number, payload: any): string | undefined {
    const fromMap = Number.isFinite(medicoId) && medicoId > 0 ? this.sanitizeLabel(this.medicoMap.get(medicoId)) : undefined;
    if (fromMap) { return fromMap; }
    const nested = payload?.medico ?? payload?.Medico;
    const nestedNombre =
      this.buildNombreCompleto(nested)
      ?? this.buildNombreCompleto(nested?.usuario ?? nested?.Usuario)
      ?? this.buildNombreCompleto(nested?.persona ?? nested?.Persona);
    if (nestedNombre) { return nestedNombre; }
    const direct = this.sanitizeLabel(payload?.medicoNombre)
      ?? this.sanitizeLabel(payload?.MedicoNombre)
      ?? this.sanitizeLabel(payload?.medico)
      ?? this.sanitizeLabel(payload?.Medico);
    if (direct && !direct.includes('@')) { return direct; }

    if (Number.isFinite(medicoId) && medicoId > 0) {
      return `Medico ${medicoId}`;
    }
    return undefined;
  }

  private buildNombreCompleto(source: any): string | undefined {
    if (!source) { return undefined; }
    const partes = [
      this.sanitizeLabel(source?.nombre ?? source?.Nombre ?? source?.usuarioNombre ?? source?.UsuarioNombre ?? source?.personaNombre ?? source?.PersonaNombre),
      this.sanitizeLabel(source?.apellido ?? source?.Apellido ?? source?.usuarioApellido ?? source?.UsuarioApellido ?? source?.personaApellido ?? source?.PersonaApellido)
    ].filter((v): v is string => !!v);
    if (partes.length) {
      return partes.join(' ').trim();
    }
    const single = this.sanitizeLabel(source?.nombreCompleto ?? source?.NombreCompleto ?? source?.displayName ?? source?.DisplayName);
    return single || undefined;
  }
}
