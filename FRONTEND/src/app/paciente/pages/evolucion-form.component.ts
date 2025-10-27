import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { EvolucionesService } from '../services/evoluciones.service';
import { ProblemasService, Problema } from '../services/problemas.service';
import { PacienteCatalogoService, Opcion } from '../services/catalogo.service';
import { TipoCampoService } from '../../services/tipo-campo.service';
import { PlantillaService } from '../../services/plantilla.service';
import { Plantilla } from '../../interfaces/plantilla';
import { MedicoService } from '../../services/medico.service';
import { CampoService } from '../../services/campo.service';

@Component({
  standalone: true,
  selector: 'app-paciente-evolucion-form',
  imports: [CommonModule, FormsModule, RouterModule],
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
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px">
                <div style="font-weight:600;font-size:16px;margin-bottom:6px">Previsualización</div>
                <div style="font-size:14px;margin-bottom:8px">
                  <div><strong>Nombre de Plantilla:</strong> {{ plantillaPreview.nombre || ('Plantilla ' + plantillaPreview.id) }}</div>
                  <div *ngIf="plantillaPreview.descripcion"><strong>Descripción:</strong> {{ plantillaPreview.descripcion }}</div>
                </div>
                <div *ngIf="!plantillaPreview.secciones.length" style="font-size:13px;color:#4b5563">
                  Esta plantilla no tiene campos definidos.
                </div>
                <ng-container *ngFor="let seccion of plantillaPreview.secciones">
                  <div style="font-weight:600;color:#4f46e5;margin-top:12px">{{ seccion.titulo }}</div>
                  <div style="display:flex;flex-direction:column;gap:12px;margin-top:6px">
                    <ng-container *ngFor="let campo of seccion.campos">
                      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;color:#374151;max-width:520px;width:100%">
                        <span>{{ campo.etiqueta }}</span>
                        <ng-container [ngSwitch]="campo.tipoEntrada">
                          <textarea *ngSwitchCase="'textarea'" rows="3" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}"></textarea>
                          <select *ngSwitchCase="'select'" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" [multiple]="campo.multiple">
                            <option *ngFor="let opcion of campo.opciones" [ngValue]="opcion">{{ opcion }}</option>
                          </select>
                          <div *ngSwitchCase="'checkbox'" style="display:flex;align-items:center;gap:8px">
                            <input type="checkbox" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}">
                            <span>Seleccionado</span>
                          </div>
                          <input *ngSwitchCase="'number'" type="number" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}" [step]="campo.step">
                          <input *ngSwitchCase="'datetime-local'" type="datetime-local" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}">
                          <input *ngSwitchDefault type="{{ campo.tipoEntrada }}" [(ngModel)]="campo.valor" [ngModelOptions]="{standalone:true}">
                        </ng-container>
                      </label>
                    </ng-container>
                  </div>
                </ng-container>
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
  preselectPlantillaId?: number;
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
  } | null = null;
  previewLoading = false;
  previewError = '';

  private camposSub?: Subscription;
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
    private tipoCampoSrv: TipoCampoService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.loadProblemas();
      this.loadEstados();
      this.loadMedicos();
      const now = new Date();
      this.fechaHora = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    });
    // Capturar plantillaId desde query params para preselección
    this.route.queryParamMap.subscribe(qp => {
      const raw = qp.get('plantillaId');
      const id = raw ? Number(raw) : NaN;
      this.preselectPlantillaId = Number.isFinite(id) && id > 0 ? id : undefined;
    });
    // Cargar catálogo de tipos de campo para poder mapear id -> nombre
    this.tipoCampoSrv.lista().subscribe({
      next: (res: any) => {
        const items: any[] = res?.estado ? (res.valor || []) : [];
        this.tiposCampos = items
          .map(x => ({ id: Number(x?.id ?? x?.Id), nombre: String(x?.nombre ?? x?.Nombre ?? '') }))
          .filter(t => Number.isFinite(t.id) && !!t.nombre);
      },
      error: () => { this.tiposCampos = []; }
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
        const prefer = this.preselectPlantillaId;
        const currentId = this.plantillaId ?? 0;
        const preferExists = prefer ? !!this.plantillas.find(p => p.id === prefer) : false;
        const currentExists = !!this.plantillas.find(p => p.id === currentId);
        if (prefer && preferExists) {
          this.plantillaId = prefer;
        } else if (!currentExists) {
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
    this.camposSub = this.campoSrv.lista(plantilla.id).subscribe({
      next: res => {
        this.previewLoading = false;
        const campos = Array.isArray(res?.valor) ? res.valor : [];
        const secciones = this.buildSecciones(campos);
        this.plantillaPreview = {
          id: plantilla.id,
          nombre: plantilla.nombre,
          descripcion: plantilla.descripcion,
          secciones
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
          secciones: []
        };
      }
    });
  }

  private buildSecciones(campos: any[]): { titulo: string; campos: VistaCampo[] }[] {
    const seccionesMap = new Map<string, { titulo: string; campos: VistaCampo[] }>();
    campos.forEach(raw => {
      const titulo = raw?.seccionTitulo || 'Campos sin sección';
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

  // Mantener el mismo mapeo de tipos que la previsualización de Mis Plantillas
  private mapTipoEntrada(nombre?: string): {
    tipoEntrada: VistaCampo['tipoEntrada'];
    multiple?: boolean;
    step?: string;
  } {
    const n = (nombre || '').toString().toLowerCase();
    switch (n) {
      case 'texto largo':
        return { tipoEntrada: 'textarea' };
      case 'número entero':
        return { tipoEntrada: 'number', step: '1' };
      case 'número decimal':
        return { tipoEntrada: 'number', step: '0.01' };
      case 'fecha y hora':
        return { tipoEntrada: 'datetime-local' };
      case 'archivo':
        // No se soporta cargar archivos en esta vista, usar input text
        return { tipoEntrada: 'text' };
      case 'email':
        return { tipoEntrada: 'email' };
      case 'teléfono':
        return { tipoEntrada: 'tel' };
      case 'casilla de verificación':
        return { tipoEntrada: 'checkbox' };
      case 'selección única':
        return { tipoEntrada: 'select' };
      case 'selección múltiple':
        return { tipoEntrada: 'select', multiple: true };
      case 'texto corto':
      default:
        return { tipoEntrada: 'text' };
    }
  }

  private mapCampo(raw: any): VistaCampo {
    const nombreTipo: string | undefined = raw?.tipoCampoNombre
      ?? this.tiposCampos.find(t => t.id === (Number(raw?.tipoCampoId) || -1))?.nombre;
    const { tipoEntrada, multiple, step } = this.mapTipoEntrada(nombreTipo);

    let valor: any = raw?.valor;
    if (tipoEntrada === 'checkbox') {
      valor = valor === true || valor === 'true' || valor === 1;
    } else if (tipoEntrada === 'select') {
      if (multiple) {
        if (Array.isArray(valor)) {
          valor = valor;
        } else if (typeof valor === 'string' && valor.trim()) {
          valor = valor.split(',').map((v: string) => v.trim());
        } else {
          valor = [];
        }
      } else if (valor === undefined || valor === null) {
        valor = '';
      }
    } else if (valor === undefined || valor === null) {
      valor = '';
    }

    return {
      id: Number(raw?.id) || 0,
      orden: raw?.orden ?? 0,
      etiqueta: raw?.etiqueta || raw?.Etiqueta || 'Campo',
      valor,
      tipoEntrada,
      opciones: tipoEntrada === 'select' ? this.parseOpciones(raw?.opciones) : undefined,
      multiple,
      step
    };
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
}

interface VistaCampo {
  id: number;
  orden?: number | null;
  etiqueta: string;
  valor: any;
  tipoEntrada: 'text' | 'textarea' | 'number' | 'datetime-local' | 'checkbox' | 'select' | 'email' | 'tel';
  opciones?: string[];
  multiple?: boolean;
  step?: string;
}
