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
import { CampoValorService } from '../../services/campo-valor.service';

type VistaCampoEntrada =
  | 'text'
  | 'textarea'
  | 'number'
  | 'decimal'
  | 'datetime-local'
  | 'checkbox'
  | 'select'
  | 'multiselect'
  | 'email'
  | 'tel'
  | 'file';


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
                <option [ngValue]="null">Vacío</option>
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
              <div style="border-radius:18px;padding:1px;background:linear-gradient(135deg,rgba(99,102,241,0.35) 0%,rgba(99,102,241,0.05) 100%);box-shadow:0 18px 40px rgba(79,70,229,0.18);">
                <div style="background:#ffffff;border-radius:17px;padding:22px 26px;display:flex;flex-direction:column;gap:22px;">
                  <div style="display:flex;flex-direction:column;gap:4px">
                    <div style="display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700;color:#1f2937">
                      <span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:rgba(79,70,229,0.12);color:#4f46e5;font-weight:600;">PV</span>
                      Previsualización
                    </div>
                    <div style="font-size:14px;color:#4b5563;display:flex;flex-wrap:wrap;gap:14px;margin-top:6px;">
                      <div><strong style="color:#1f2937">Nombre:</strong> {{ plantillaPreview.nombre || ('Plantilla ' + plantillaPreview.id) }}</div>
                      <div *ngIf="plantillaPreview.descripcion"><strong style="color:#1f2937">Descripción:</strong> {{ plantillaPreview.descripcion }}</div>
                    </div>
                  </div>
                  <div *ngIf="!plantillaPreview.secciones.length" style="font-size:14px;color:#6b7280;background:#f9fafb;border:1px dashed #d1d5db;border-radius:14px;padding:18px;text-align:center;">
                    Esta plantilla no tiene campos definidos todavía.
                  </div>
                  <ng-container *ngFor="let seccion of plantillaPreview.secciones">
                    <div style="display:flex;flex-direction:column;gap:14px">
                      <div style="display:flex;align-items:center;gap:12px">
                        <span style="padding:6px 12px;border-radius:999px;background:rgba(79,70,229,0.12);color:#4f46e5;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Sección</span>
                        <span style="font-weight:700;font-size:16px;color:#1f2937;">{{ seccion.titulo }}</span>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;">
                        <ng-container *ngFor="let campo of seccion.campos">
                          <div style="display:flex;flex-direction:column;gap:10px;background:linear-gradient(145deg,rgba(249,250,251,1) 0%,rgba(255,255,255,1) 100%);border:1px solid #e5e7eb;border-radius:16px;padding:16px;box-shadow:0 10px 24px rgba(15,23,42,0.06);">
                            <span style="font-weight:600;font-size:13px;color:#1f2937;text-transform:none">{{ campo.etiqueta }}</span>
                        <ng-container [ngSwitch]="campo.tipoEntrada">
                          <input *ngSwitchCase="'text'" type="text" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;" />
                          <textarea *ngSwitchCase="'textarea'" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;min-height:92px;resize:vertical;"></textarea>
                          <input *ngSwitchCase="'number'" type="number" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" [step]="campo.step || '1'" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;" />
                          <input *ngSwitchCase="'decimal'" type="number" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" [step]="campo.step || '0.01'" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;" />
                          <input *ngSwitchCase="'datetime-local'" type="datetime-local" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;" />
                          <select *ngSwitchCase="'select'" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;appearance:none;">
                            <option [ngValue]="''">Seleccione</option>
                            <option *ngFor="let opt of (campo.opciones || [])" [ngValue]="opt">{{ opt }}</option>
                          </select>
                          <select *ngSwitchCase="'multiselect'" multiple [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;min-height:92px;">
                            <option *ngFor="let opt of (campo.opciones || [])" [ngValue]="opt">{{ opt }}</option>
                          </select>
                          <label *ngSwitchCase="'checkbox'" style="display:flex;align-items:center;gap:10px;font-size:14px;color:#1f2937;">
                                <input type="checkbox" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:18px;height:18px;border-radius:6px;accent-color:#4f46e5;" />
                                <span>{{ campo.valor ? 'Seleccionado' : 'No seleccionado' }}</span>
                              </label>
                          <input *ngSwitchCase="'file'" type="file" disabled style="width:100%;padding:10px 12px;border:1px dashed #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#6b7280;" />
                          <input *ngSwitchCase="'email'" type="email" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;" />
                          <input *ngSwitchCase="'tel'" type="tel" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;" />
                          <input *ngSwitchDefault type="text" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;font-size:14px;color:#1f2937;" />
                        </ng-container>
                          </div>
                        </ng-container>
                      </div>
                    </div>
                  </ng-container>

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
  plantillaId: number | null | undefined;
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

  private tiposCampos: { id: number; nombre: string }[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evo: EvolucionesService,
    private probs: ProblemasService,
    private catalogo: PacienteCatalogoService,
    private plantillaSrv: PlantillaService,
    private medicoSrv: MedicoService,
    private campoSrv: CampoService,
    private tipoCampoSrv: TipoCampoService,
    private campoValorSrv: CampoValorService
  ) {}

  ngOnInit(): void {
    void this.ensureTiposCampo();
    this.loadTiposCampos();

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
    this.plantillaId = null;
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
      const nuevaEvolucion = await firstValueFrom(this.evo.create({
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
      if (nuevaEvolucion?.id && typeof this.plantillaId === 'number' && this.plantillaId > 0) {
        try {
          await this.guardarValoresPlantilla(nuevaEvolucion.id);
        } catch (err) {
          console.error('La evolución se guardó pero falló el guardado de campos de plantilla', err);
          window.alert('La evolución se creó, pero no se pudieron guardar los valores de la plantilla.');
        }
      }
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

  private loadTiposCampos(): void {
    this.tipoCampoSrv.lista().subscribe({
      next: resp => {
        const items: any[] = resp?.estado ? (resp.valor || []) : [];
        this.tiposCampos = items
          .map(item => ({ id: Number(item?.id ?? item?.Id), nombre: item?.nombre ?? item?.Nombre ?? '' }))
          .filter(item => Number.isFinite(item.id) && item.id > 0 && !!item.nombre);
        if (typeof this.plantillaId === 'number' && this.plantillaId > 0) {
          this.applyTemplate();
        }
      },
      error: err => console.error('No se pudo cargar la lista de tipos de campo', err)
    });
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
        const currentId = typeof this.plantillaId === 'number' ? this.plantillaId : null;
        const usuarioEligioVacio = this.plantillaId === null;
        const exists = currentId != null ? !!this.plantillas.find(p => p.id === currentId) : false;
        if (!exists && !usuarioEligioVacio) {
          this.plantillaId = this.plantillas[0]?.id ?? null;
        }
        if (typeof this.plantillaId === 'number' && this.plantillaId > 0) {
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
    const activos = Array.isArray(campos)
      ? campos.filter(c => c?.activo === 1 || c?.activo === true)
      : [];
    const ordenados = [...activos].sort((a, b) => (a?.orden ?? 0) - (b?.orden ?? 0));

    const secciones: { titulo: string; campos: VistaCampo[] }[] = [];
    let seccionActual: { titulo: string; campos: VistaCampo[] } | null = null;

    ordenados.forEach(raw => {
      const tipoNombre = this.resolveTipoCampoNombre(raw);
      if (tipoNombre === '__SECCION__') {
        seccionActual = {
          titulo: raw?.etiqueta || raw?.Etiqueta || 'Sección sin título',
          campos: []
        };
        secciones.push(seccionActual);
        return;
      }

      if (!seccionActual) {
        seccionActual = { titulo: 'Campos sin sección', campos: [] };
        secciones.push(seccionActual);
      }

      const campo = this.mapCampo(raw, tipoNombre);
      seccionActual.campos.push(campo);
    });

    return secciones;
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

  private mapCampo(raw: any, tipoCampoNombre?: string): VistaCampo {
    const tipoNombre = (tipoCampoNombre ?? this.resolveTipoCampoNombre(raw) ?? '').toString();
    const tipoEntrada = this.getInputType(tipoNombre);
    let valor: any = raw?.valor;
    const opciones = this.parseOpciones(raw?.opciones);

    switch (tipoEntrada) {
      case 'checkbox':
        valor = valor === true || valor === 'true' || valor === 1;
        break;
      case 'multiselect':
        if (Array.isArray(valor)) {
          valor = valor
            .map((v: any) => (v != null ? v.toString().trim() : ''))
            .filter(Boolean);
        } else if (typeof valor === 'string' && valor.trim()) {
          valor = valor.split(/[\n;,]/).map((v: string) => v.trim()).filter(Boolean);
        } else {
          valor = [];
        }
        break;
      case 'select':
        if (Array.isArray(valor)) {
          valor = valor[0] ?? '';
        } else if (valor === undefined || valor === null) {
          valor = '';
        } else {
          valor = valor.toString();
        }
        break;
      case 'datetime-local':
        valor = this.formatDateTime(valor);
        break;
      case 'number':
      case 'decimal':
        valor = valor === undefined || valor === null ? '' : valor;
        break;
      default:
        if (valor === undefined || valor === null) {
          valor = '';
        }
        break;
    }

    const step =
      tipoEntrada === 'decimal' ? '0.01' :
      tipoEntrada === 'number' ? '1' :
      undefined;

    return {
      id: Number(raw?.id ?? raw?.Id) || 0,
      orden: raw?.orden ?? raw?.Orden ?? 0,
      etiqueta: raw?.etiqueta || raw?.Etiqueta || 'Campo',
      valor,
      tipoEntrada,
      tipoCampoNombre: tipoNombre || 'Texto Corto',
      opciones: (tipoEntrada === 'select' || tipoEntrada === 'multiselect') && opciones.length ? opciones : undefined,
      step
    };
  }

  private getInputType(tipo: string): VistaCampo['tipoEntrada'] {
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
    const tipoId = Number(raw?.tipoCampoId ?? raw?.TipoCampoId);
    if (!Number.isFinite(tipoId) || tipoId <= 0) {
      return '';
    }
    if (tipoId === 1002) {
      return '__SECCION__';
    }
    const fromMap = this.tipoCampoMap.get(tipoId);
    if (fromMap) {
      return fromMap;
    }
    const fromLista = this.tiposCampos.find(t => t.id === tipoId);
    return fromLista?.nombre?.toString() ?? '';
  }

  private ensureTiposCampo(): Promise<void> {
    if (this.tipoCampoMap.size) {
      return Promise.resolve();
    }
    if (this.tiposRequest) {
      return this.tiposRequest;
    }

    const request = firstValueFrom(this.tipoCampoSrv.lista())
      .then(res => {
        const lista: any[] = res?.estado && Array.isArray(res?.valor) ? res.valor : [];
        lista.forEach(item => {
          const id = Number(item?.id ?? item?.Id);
          const nombre = (item?.nombre ?? item?.Nombre ?? '').toString();
          if (Number.isFinite(id) && id > 0 && nombre) {
            this.tipoCampoMap.set(id, nombre);
          }
        });
      });

    this.tiposRequest = request.finally(() => {
      this.tiposRequest = undefined;
    });

    return this.tiposRequest;
  }


  private parseOpciones(opciones?: string | null): string[] {
    if (!opciones) return [];
    return opciones
      .split(/[\n;,]/)
      .map(opcion => opcion.trim())
      .filter(Boolean);
  }


  private formatDateTime(valor: any): string {
    if (!valor) return '';
    if (valor instanceof Date) {
      const local = new Date(valor.getTime() - valor.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    }
    if (typeof valor === 'string') {
      const parsed = new Date(valor);
      if (!isNaN(parsed.getTime())) {
        const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
      }
      return valor.slice(0, 16);
    }
    if (typeof valor === 'number') {
      const date = new Date(valor);
      if (!isNaN(date.getTime())) {
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
      }
    }
    return '';
  }

  private async guardarValoresPlantilla(evolucionId: number): Promise<void> {
    if (!this.plantillaPreview || !this.plantillaPreview.secciones.length) {
      return;
    }
    const campos = this.plantillaPreview.secciones
      .flatMap(seccion => seccion.campos)
      .filter(campo => campo.id > 0 && campo.tipoEntrada !== 'file');

    const payloads = campos
      .map(campo => {
        const valor = this.serializarCampoValor(campo);
        const debeGuardar = campo.tipoEntrada === 'checkbox'
          ? true
          : (valor ?? '').trim().length > 0;
        if (!debeGuardar) {
          return null;
        }
        return {
          campoId: campo.id,
          valor: valor ?? ''
        };
      })
      .filter((item): item is { campoId: number; valor: string } => !!item);

    if (!payloads.length) {
      return;
    }

    await Promise.all(payloads.map(item =>
      firstValueFrom(this.campoValorSrv.crear({
        id: 0,
        campoId: item.campoId,
        evolucionId,
        valor: item.valor
      }))
    ));
  }

  private serializarCampoValor(campo: VistaCampo): string | null {
    switch (campo.tipoEntrada) {
      case 'checkbox':
        return campo.valor ? 'true' : 'false';
      case 'multiselect':
        if (Array.isArray(campo.valor) && campo.valor.length) {
          return campo.valor.map((v: string) => v?.toString().trim()).filter(Boolean).join(', ');
        }
        return '';
      case 'datetime-local':
        return campo.valor ? campo.valor.toString() : '';
      case 'number':
      case 'decimal':
        if (campo.valor === undefined || campo.valor === null || campo.valor === '') {
          return '';
        }
        return campo.valor.toString();
      case 'select':
      case 'text':
      case 'textarea':
      case 'email':
      case 'tel':
        return campo.valor != null ? campo.valor.toString() : '';
      default:
        return campo.valor != null ? campo.valor.toString() : '';
    }
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
  tipoEntrada: VistaCampoEntrada;
  opciones?: string[];
  step?: string;
  tipoCampoNombre: string;
}
