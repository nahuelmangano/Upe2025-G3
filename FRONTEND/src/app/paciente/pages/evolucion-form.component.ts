import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { EvolucionesService } from '../services/evoluciones.service';
import { ProblemasService, Problema } from '../services/problemas.service';
import { PacienteCatalogoService, Opcion } from '../services/catalogo.service';
import { PlantillaService } from '../../services/plantilla.service';
import { Plantilla } from '../../interfaces/plantilla';
import { MedicoService } from '../../services/medico.service';
import { CampoService } from '../../services/campo.service';
import { TipoCampoService } from '../../services/tipo-campo.service';

@Component({
  standalone: true,
  selector: 'app-paciente-evolucion-form',
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .preview-card {
      margin-top: 12px;
      padding: 22px 26px;
      border-radius: 18px;
      background: #f8faff;
      border: 1px solid #e5e9f2;
      box-shadow: 0 3px 12px rgba(15,23,42,0.04);
    }
    .preview-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 18px;
    }
    .preview-title {
      font-weight: 600;
      font-size: 1rem;
      color: #1f2937;
    }
    .preview-info {
      display: flex;
      gap: 6px;
      align-items: baseline;
      flex-wrap: wrap;
      font-size: 0.9rem;
      color: #4b5563;
    }
    .preview-label {
      font-weight: 600;
      color: #1f2937;
      margin-right: 4px;
    }
    .preview-name {
      font-weight: 600;
      color: #111827;
    }
    .preview-description {
      margin: 12px 0 20px;
      padding: 12px 14px;
      background: #f1f5f9;
      border-radius: 12px;
      color: #4b5563;
      font-size: 0.9rem;
    }
    .preview-empty {
      font-size: 0.9rem;
      color: #6b7280;
      padding: 18px;
      border-radius: 14px;
      border: 1px dashed #d1d5db;
      background: #ffffff;
    }
    .preview-section {
      background: #ffffff;
      border: 1px solid #e5e9f2;
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 18px;
    }
    .preview-section-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 14px;
    }
    .preview-section h3 {
      margin: 0 0 14px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #4f46e5;
    }
    .preview-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .preview-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .preview-field label {
      font-size: 0.84rem;
      font-weight: 600;
      color: #374151;
      display: block;
    }
    .preview-control {
      width: 100%;
      border: 1px solid #d4dae8;
      border-radius: 10px;
      padding: 10px 12px;
      background: #ffffff;
      font-size: 0.95rem;
      color: #1f2937;
    }
    .preview-control:focus {
      outline: none;
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129,140,248,0.2);
    }
    .preview-control--textarea {
      min-height: 96px;
      resize: vertical;
    }
    .preview-control--multi {
      min-height: 110px;
    }
    .preview-checkbox {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: #4b5563;
    }
    .preview-options {
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 0.78rem;
      color: #6b7280;
    }
    .preview-section-meta {
      font-size: 0.78rem;
      color: #6b7280;
    }
    .preview-option {
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid #d1d5db;
      color: #475569;
      background: #f8fafc;
    }
    .preview-option--active {
      border-color: #6366f1;
      background: #eef2ff;
      color: #4338ca;
    }
    .preview-file-name {
      margin-top: 6px;
      font-size: 0.78rem;
      color: #6b7280;
    }
    @media (max-width: 768px) {
      .preview-card {
        padding: 20px;
      }
    }
  `],
  template: `
    <div class="card">
      <h3 class="h3" style="margin-bottom:12px">Evolucion</h3>
      <div style="display:grid;grid-template-columns:300px 1fr;gap:18px">
        <!-- Lateral problemas -->
        <div class="side-card" style="background:#f7f7fb;border:1px solid var(--line);border-radius:10px;padding:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <button class="btn" type="button" (click)="nuevoProblema()">+ Problema</button>
            <select [(ngModel)]="maxMostrar" style="height:34px">
              <option [ngValue]="10">Mostrar maximo 10</option>
              <option [ngValue]="25">Mostrar maximo 25</option>
              <option [ngValue]="100">Mostrar maximo 100</option>
            </select>
          </div>
          <div style="font-weight:600;margin:6px 0">Problema a asociar</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <button
              *ngFor="let pr of problemas"
              (click)="selectProblema(pr)"
              class="btn-outline"
              [ngStyle]="{borderColor: selectedProblema?.id===pr.id ? 'var(--primary)' : '#cfc7ff', color: selectedProblema?.id===pr.id ? 'var(--primary)' : '#6b7280'}"
            >
              {{ pr.titulo }}
            </button>
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
            <label style="grid-column:4/7">
              <span>Medico</span>
              <select [(ngModel)]="medicoId" name="medicoId" (change)="onMedicoChange()">
                <option [ngValue]="undefined">Seleccione</option>
                <option *ngFor="let m of medicos" [ngValue]="m.id">{{ m.nombre }}</option>
              </select>
            </label>

            <label style="grid-column:1/7">
              <span>Problema</span>
              <input [value]="selectedProblema?.titulo || ''" placeholder="Seleccione desde la izquierda" disabled />
            </label>
            <label style="grid-column:1/3">
              <span>Estado del problema</span>
              <select [(ngModel)]="estadoProblemaId" name="estadoProblemaId">
                <option *ngFor="let e of estados" [ngValue]="e.id">{{ e.nombre }}</option>
              </select>
            </label>
            <label style="grid-column:3/5">
              <span>Plantillas</span>
              <select [(ngModel)]="plantillaId" (change)="applyTemplate()" name="plantillaId">
                <option [ngValue]="undefined">Seleccione</option>
                <option [ngValue]="0">Vacío</option>
                <option *ngFor="let t of plantillas" [ngValue]="t.id">{{ t.nombre || ('Plantilla ' + t.id) }}</option>
              </select>
            </label>
            <div style="grid-column:1/7" *ngIf="previewLoading">
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px">
                <strong>Previsualización</strong>
                <p style="margin:8px 0 0;font-size:13px;color:#4b5563">Cargando plantilla…</p>
              </div>
            </div>
            <div style="grid-column:1/7" *ngIf="previewError && !previewLoading">
              <div style="background:#fdf2f2;border:1px solid #fecaca;border-radius:8px;padding:14px">
                <strong>Previsualización</strong>
                <p style="margin:8px 0 0;font-size:13px;color:#b91c1c">{{ previewError }}</p>
              </div>
            </div>
            <div style="grid-column:1/7" *ngIf="plantillaPreview && !previewLoading">
              <div class="preview-card">
                <div class="preview-head">
                  <span class="preview-title">Previsualización de Plantilla</span>
                  <span class="preview-info">
                    {{ plantillaPreview.secciones.length === 1 ? '1 sección' : (plantillaPreview.secciones.length + ' secciones') }}
                    ·
                    {{ plantillaPreview.totalCampos === 1 ? '1 campo' : (plantillaPreview.totalCampos + ' campos') }}
                  </span>
                </div>
                <div class="preview-info">
                  <span class="preview-label">Nombre:</span>
                  <span class="preview-name">{{ plantillaPreview.nombre || ('Plantilla ' + plantillaPreview.id) }}</span>
                </div>
                <div class="preview-description" *ngIf="plantillaPreview.descripcion">
                  {{ plantillaPreview.descripcion }}
                </div>
                <div *ngIf="!plantillaPreview.secciones.length" class="preview-empty">
                  Esta plantilla no tiene campos definidos.
                </div>
                <div *ngFor="let seccion of plantillaPreview.secciones" class="preview-seccion">
                  <div class="preview-section-heading">
                    <h3 class="preview-seccion-titulo">{{ seccion.titulo }}</h3>
                    <div class="preview-section-meta">
                      <span>{{ seccion.campos.length === 1 ? '1 campo' : (seccion.campos.length + ' campos') }}</span>
                    </div>
                  </div>
                  <div class="preview-fields">
                    <div *ngFor="let campo of seccion.campos" class="preview-field">
                      <label>{{ campo.etiqueta }}</label>
                      <ng-container [ngSwitch]="campo.tipoEntrada">
                        <textarea
                          *ngSwitchCase="'textarea'"
                          class="preview-control preview-control--textarea"
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                        ></textarea>
                        <select
                          *ngSwitchCase="'select'"
                          class="preview-control"
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                        >
                          <option *ngFor="let opcion of campo.opciones || []" [ngValue]="opcion">{{ opcion }}</option>
                        </select>
                        <select
                          *ngSwitchCase="'multiselect'"
                          class="preview-control preview-control--multi"
                          multiple
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                        >
                          <option *ngFor="let opcion of campo.opciones || []" [ngValue]="opcion">{{ opcion }}</option>
                        </select>
                        <div *ngSwitchCase="'checkbox'" class="preview-checkbox">
                          <input
                            type="checkbox"
                            [(ngModel)]="campo.valor"
                            [ngModelOptions]="{standalone:true}"
                          />
                          <span>{{ campo.valor ? 'Seleccionado' : 'Sin seleccionar' }}</span>
                        </div>
                        <input
                          *ngSwitchCase="'number'"
                          class="preview-control"
                          type="number"
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                          [step]="campo.step || '1'"
                        />
                        <input
                          *ngSwitchCase="'decimal'"
                          class="preview-control"
                          type="number"
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                          [step]="campo.step || '0.01'"
                        />
                        <input
                          *ngSwitchCase="'datetime-local'"
                          class="preview-control"
                          type="datetime-local"
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                        />
                        <input
                          *ngSwitchCase="'email'"
                          class="preview-control"
                          type="email"
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                        />
                        <input
                          *ngSwitchCase="'tel'"
                          class="preview-control"
                          type="tel"
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                        />
                        <input
                          *ngSwitchCase="'file'"
                          class="preview-control"
                          type="file"
                          (change)="onFileChange($event, campo)"
                        />
                        <input
                          *ngSwitchDefault
                          class="preview-control"
                          type="text"
                          [(ngModel)]="campo.valor"
                          [ngModelOptions]="{standalone:true}"
                        />
                      </ng-container>
                      <div
                        class="preview-options"
                        *ngIf="campo.opciones?.length && (campo.tipoEntrada === 'select' || campo.tipoEntrada === 'multiselect')"
                      >
                        <span>Opciones:</span>
                        <span
                          class="preview-option"
                          [ngClass]="{
                            'preview-option--active': esOpcionActiva(campo, opcion)
                          }"
                          *ngFor="let opcion of campo.opciones"
                        >
                          {{ opcion }}
                        </span>
                      </div>
                      <div *ngIf="campo.tipoEntrada === 'file' && campo.valor" class="preview-file-name">
                        {{ campo.valor?.name || campo.valor }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style="grid-column:1/7">
              <span style="display:block;margin-bottom:6px;color:#374151;font-size:14px">Diagnostico Inicial</span>
              <textarea rows="12" [(ngModel)]="texto" placeholder="Ingrese aqui una evolucion..."></textarea>
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
            <small>Evolucionado por <strong>{{ currentMedicoNombre() }}</strong></small>
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
  plantillas: Plantilla[] = [];
  plantillaId: number | undefined;
  estados: Opcion[] = [];
  estadoProblemaId?: number;
  medicos: { id: number; nombre: string }[] = [];
  medicoId?: number;

  fechaHora = '';
  texto = '';
  maxMostrar = 10;

  plantillaPreview: {
    id: number;
    nombre?: string | null;
    descripcion?: string | null;
    secciones: { titulo: string; campos: VistaCampo[] }[];
    totalCampos: number;
  } | null = null;
  previewLoading = false;
  previewError = '';

  private camposSub?: Subscription;
  private tipoCampoMap = new Map<number, string>();
  private tiposRequest?: Promise<void>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evo: EvolucionesService,
    private probs: ProblemasService,
    private catalogo: PacienteCatalogoService,
    private plantillaSrv: PlantillaService,
    private medicoSrv: MedicoService,
    private campoSrv: CampoService,
    private tipoCampoSrv: TipoCampoService
  ) {}

  ngOnInit(): void {
    void this.ensureTiposCampo();
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.loadProblemas();
      this.loadEstados();
      this.loadMedicos();
      const now = new Date();
      this.fechaHora = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    });
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.camposSub?.unsubscribe();
  }

  selectProblema(p: Problema): void {
    this.selectedProblema = p;
    if (typeof (p as any)?.estadoId === 'number') {
      this.estadoProblemaId = (p as any).estadoId;
    }
  }
  applyTemplate(): void {
    if (!this.plantillaId) {
      this.texto = '';
      this.resetPlantillaPreview();
      return;
    }
    const tpl = this.plantillas.find(x => x.id === this.plantillaId);
    this.texto = tpl?.descripcion ?? '';
    if (tpl) {
      this.loadPlantillaCampos(tpl);
    } else {
      this.resetPlantillaPreview();
    }
  }
  clear(): void {
    this.texto = '';
    this.plantillaId = 0;
    this.resetPlantillaPreview();
  }
  async guardar(): Promise<void> {
    if (!this.selectedProblema?.id) {
      window.alert('Selecciona un problema antes de guardar.');
      return;
    }
    if (!this.medicoId) {
      window.alert('Selecciona un medico antes de guardar.');
      return;
    }
    if (this.plantillaId === undefined) {
      window.alert('Selecciona una plantilla antes de guardar.');
      return;
    }
    if (this.estadoProblemaId === undefined || this.estadoProblemaId === null) {
      window.alert('Selecciona un estado para el problema.');
      return;
    }

    const fechaIso = this.fechaHora ? new Date(this.fechaHora).toISOString() : new Date().toISOString();
    const diagnostico = this.texto.trim() ? this.texto.trim().slice(0, 250) : 'Sin detalle';

    try {
      await firstValueFrom(this.evo.create({
        descripcion: this.texto,
        fechaConsulta: fechaIso,
        diagnosticoInicial: diagnostico,
        diagnosticoDefinitivo: undefined,
        pacienteId: this.pacienteId,
        problemaId: this.selectedProblema.id,
        estadoProblemaId: this.estadoProblemaId,
        medicoId: this.medicoId,
        plantillaId: this.plantillaId
      }));
      this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'evoluciones']);
    } catch (err) {
      console.error('No se pudo crear la evolucion', err);
      window.alert('Ocurrio un error al guardar la evolucion.');
    }
  }
  nuevoProblema(): void { this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'problemas', 'nuevo']); }

  onMedicoChange(): void {
    if (this.medicoId) {
      this.loadPlantillas(this.medicoId);
    } else {
      this.plantillas = [];
      this.plantillaId = undefined;
      this.resetPlantillaPreview();
    }
  }

  currentMedicoNombre(): string {
    if (!this.medicoId) {
      return 'Selecciona un medico';
    }
    return this.medicos.find(m => m.id === this.medicoId)?.nombre || 'Medico seleccionado';
  }

  private loadProblemas(): void {
    this.probs.list().subscribe({
      next: lista => {
        this.problemas = lista;
        if (!this.selectedProblema && lista.length) {
          this.selectProblema(lista[0]);
        }
      },
      error: err => console.error('No se pudo cargar la lista de problemas', err)
    });
  }

  private loadEstados(): void {
    this.catalogo.estadosProblema().subscribe({
      next: estados => {
        this.estados = estados;
        if (this.estadoProblemaId === undefined && estados.length) {
          this.estadoProblemaId = estados[0].id;
        }
      },
      error: err => console.error('No se pudo cargar la lista de estados', err)
    });
  }

  private loadMedicos(): void {
    this.medicoSrv.lista().subscribe({
      next: resp => {
        const items: any[] = resp?.estado ? (resp.valor || []) : [];
        this.medicos = items
          .map(item => {
            const id = Number(item?.id ?? item?.Id);
            if (!Number.isFinite(id) || id <= 0) {
              return null;
            }
            const nombre = [
              item?.usuarioNombre ?? item?.UsuarioNombre ?? item?.nombre ?? item?.Nombre ?? '',
              item?.usuarioApellido ?? item?.UsuarioApellido ?? item?.apellido ?? item?.Apellido ?? ''
            ].filter(Boolean).join(' ').trim();
            const email = item?.usuarioMail ?? item?.UsuarioMail ?? '';
            const display = nombre || email || `Medico ${id}`;
            return { id, nombre: display };
          })
          .filter((v): v is { id: number; nombre: string } => !!v);

        if (!this.medicoId && this.medicos.length) {
          this.medicoId = this.medicos[0].id;
          this.loadPlantillas(this.medicoId);
        }
      },
      error: err => console.error('No se pudo cargar la lista de medicos', err)
    });
  }

  private loadPlantillas(medicoId: number): void {
    this.plantillaSrv.listaPorMedico(medicoId).subscribe({
      next: resp => {
        const items: Plantilla[] = resp?.estado ? (resp.valor || []) : [];
        this.plantillas = items;
        const currentId = this.plantillaId ?? 0;
        const exists = !!this.plantillas.find(p => p.id === currentId);
        if (!exists) {
          this.plantillaId = this.plantillas[0]?.id ?? 0;
        }
        if (this.plantillaId && this.plantillaId !== 0) {
          this.applyTemplate();
        } else {
          this.resetPlantillaPreview();
        }
      },
      error: err => {
        console.error('No se pudo cargar la lista de plantillas', err);
        this.plantillas = [];
        this.plantillaId = undefined;
        this.resetPlantillaPreview();
      }
    });
  }

  private loadPlantillaCampos(plantilla: Plantilla): void {
    this.camposSub?.unsubscribe();
    this.previewError = '';
    this.previewLoading = true;
    this.ensureTiposCampo()
      .catch(err => {
        console.error('No se pudieron cargar los tipos de campo', err);
      })
      .finally(() => {
        this.camposSub = this.campoSrv.lista(plantilla.id).subscribe({
          next: res => {
            this.previewLoading = false;
            const campos = Array.isArray(res?.valor) ? res.valor : [];
            const secciones = this.buildSecciones(campos);
            this.plantillaPreview = {
              id: plantilla.id,
              nombre: plantilla.nombre,
              descripcion: plantilla.descripcion,
              secciones,
              totalCampos: this.countCampos(secciones)
            };
          },
          error: err => {
            console.error('No se pudo cargar la plantilla seleccionada', err);
            this.previewLoading = false;
            this.previewError = 'No se pudieron cargar los campos de la plantilla.';
            this.plantillaPreview = {
              id: plantilla.id,
              nombre: plantilla.nombre,
              descripcion: plantilla.descripcion,
              secciones: [],
              totalCampos: 0
            };
          }
        });
      });
  }

  private buildSecciones(campos: any[]): { titulo: string; campos: VistaCampo[] }[] {
    const seccionesMap = new Map<string, { titulo: string; campos: VistaCampo[] }>();
    campos.forEach(raw => {
      const titulo = raw?.seccionTitulo || 'Sección sin título';
      let seccion = seccionesMap.get(titulo);
      if (!seccion) {
        seccion = { titulo, campos: [] };
        seccionesMap.set(titulo, seccion);
      }
      const campo = this.mapCampo(raw);
      seccion.campos.push(campo);
    });

    return Array.from(seccionesMap.values()).map(seccion => ({
      titulo: seccion.titulo,
      campos: [...seccion.campos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    }));
  }

  countCampos(secciones: { titulo: string; campos: VistaCampo[] }[]): number {
    return secciones.reduce((total, seccion) => total + seccion.campos.length, 0);
  }

  esOpcionActiva(campo: VistaCampo, opcion: string): boolean {
    if (!campo || !opcion) return false;
    if (campo.tipoEntrada === 'multiselect' && Array.isArray(campo.valor)) {
      return campo.valor.includes(opcion);
    }
    return campo.valor === opcion;
  }

  private mapCampo(raw: any): VistaCampo {
    const tipoCampoNombre = this.resolveTipoCampoNombre(raw) || 'Texto Corto';
    const tipoEntrada = this.getInputType(tipoCampoNombre);
    let step: string | undefined;
    if (tipoEntrada === 'number') {
      step = '1';
    } else if (tipoEntrada === 'decimal') {
      step = '0.01';
    }

    let valor: any = raw?.valor;
    if (tipoEntrada === 'checkbox') {
      valor = valor === true || valor === 'true' || valor === 1;
    } else if (tipoEntrada === 'select') {
      if (valor === undefined || valor === null) {
        valor = '';
      } else {
        valor = valor.toString();
      }
    } else if (tipoEntrada === 'multiselect') {
      if (Array.isArray(valor)) {
        valor = valor
          .map((v: any) => (v != null ? v.toString().trim() : ''))
          .filter(Boolean);
      } else if (typeof valor === 'string' && valor.trim()) {
        valor = valor.split(',').map((v: string) => v.trim());
      } else {
        valor = [];
      }
    } else if (tipoEntrada === 'file') {
      valor = raw?.valor ?? null;
    } else if (valor === undefined || valor === null) {
      valor = '';
    }

    return {
      id: Number(raw?.id) || 0,
      orden: raw?.orden ?? 0,
      etiqueta: raw?.etiqueta || raw?.Etiqueta || 'Campo',
      valor,
      tipoEntrada,
      opciones: tipoEntrada === 'select' || tipoEntrada === 'multiselect' ? this.parseOpciones(raw?.opciones) : undefined,
      step,
      tipoCampoNombre
    };
  }

  getInputType(tipo: string): VistaCampo['tipoEntrada'] {
    if (!tipo) return 'text';
    const nombre = tipo
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    switch (nombre) {
      case 'text': return 'text';
      case 'textarea': return 'textarea';
      case 'checkbox': return 'checkbox';
      case 'select': return 'select';
      case 'multiselect': return 'multiselect';
      case 'number': return 'number';
      case 'decimal': return 'decimal';
      case 'datetime-local':
      case 'datetime':
      case 'fecha hora': return 'datetime-local';
      case 'texto corto': return 'text';
      case 'texto largo': return 'textarea';
      case 'numero entero': return 'number';
      case 'numero decimal': return 'decimal';
      case 'fecha y hora': return 'datetime-local';
      case 'archivo': return 'file';
      case 'email': return 'email';
      case 'telefono': return 'tel';
      case 'casilla de verificacion': return 'checkbox';
      case 'seleccion unica': return 'select';
      case 'seleccion multiple': return 'multiselect';
      default: return 'text';
    }
  }

  private resolveTipoCampoNombre(raw: any): string {
    const nombreDirecto = raw?.tipoCampoNombre ?? raw?.TipoCampoNombre;
    if (nombreDirecto) {
      return nombreDirecto.toString();
    }
    const id = Number(raw?.tipoCampoId ?? raw?.TipoCampoId);
    if (Number.isFinite(id) && id > 0) {
      const nombre = this.tipoCampoMap.get(id);
      if (nombre) {
        return nombre;
      }
    }
    return '';
  }

  private ensureTiposCampo(): Promise<void> {
    if (this.tipoCampoMap.size) {
      return Promise.resolve();
    }
    if (this.tiposRequest) {
      return this.tiposRequest;
    }

    this.tiposRequest = firstValueFrom(this.tipoCampoSrv.lista())
      .then(res => {
        const lista: any[] = res?.estado && Array.isArray(res?.valor) ? res.valor : [];
        lista.forEach(item => {
          const id = Number(item?.id ?? item?.Id);
          const nombre = (item?.nombre ?? item?.Nombre ?? '').toString();
          if (Number.isFinite(id) && id > 0 && nombre) {
            this.tipoCampoMap.set(id, nombre);
          }
        });
      })
      .catch(err => {
        this.tiposRequest = undefined;
        throw err;
      });

    return this.tiposRequest;
  }

  private parseOpciones(opciones?: string | null): string[] {
    if (!opciones) return [];
    return opciones
      .split(/[\n;,]/)
      .map(op => op.trim())
      .filter(Boolean);
  }

  private resetPlantillaPreview(): void {
    this.camposSub?.unsubscribe();
    this.plantillaPreview = null;
    this.previewLoading = false;
    this.previewError = '';
  }

  onFileChange(event: Event, campo: VistaCampo): void {
    const input = event.target as HTMLInputElement;
    campo.valor = input.files && input.files.length ? input.files[0] : null;
  }
}

interface VistaCampo {
  id: number;
  orden?: number | null;
  etiqueta: string;
  valor: any;
  tipoEntrada: 'text' | 'textarea' | 'number' | 'decimal' | 'datetime-local' | 'checkbox' | 'select' | 'multiselect' | 'email' | 'tel' | 'file';
  opciones?: string[];
  step?: string;
  tipoCampoNombre: string;
}
