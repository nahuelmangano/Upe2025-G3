import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { EvolucionesService } from '@features/paciente/services/evoluciones.service';
import { ProblemasService, Problema } from '@features/paciente/services/problemas.service';
import { PacienteCatalogoService, Opcion } from '@features/paciente/services/catalogo.service';
import { PlantillaService } from '@features/medico/services/plantilla.service';
import { Plantilla } from '@features/medico/interfaces/plantilla';
import { MedicoService } from '@features/medico/services/medico.service';
import { CampoService } from '@features/medico/services/campo.service';
import { TipoCampoService } from '@features/medico/services/tipo-campo.service';
import { CampoValorService } from '@features/medico/services/campo-valor.service';
import { UtilidadService } from '@core/services/utilidad.service';

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
  templateUrl: './evolucion-form.component.html',
  styleUrls: ['./evolucion-form.component.css']
})
export class EvolucionFormComponent implements OnInit, OnDestroy {
  @ViewChild('fechaHoraInput') fechaHoraInput?: ElementRef<HTMLInputElement>;
  pacienteId = 0;
  sub?: Subscription;

  problemas: Problema[] = [];
  selectedProblema: Problema | null = null;
  selectedProblemaId: number | null = null;
  plantillas: Plantilla[] = [];
  plantillaId: number | null | undefined;
  estados: Opcion[] = [];
  estadoProblemaId?: number;
  medicos: { id: number; nombre: string; usuarioId?: number }[] = [];
  medicoId?: number;

  fechaHora = '';
  fechaMaxima = '';
  texto = '';

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
    private campoValorSrv: CampoValorService,
    private utilidadSrv: UtilidadService
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
      this.fechaHora = this.formatDateTime(now);
      this.updateFechaMaxima();
    });
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.camposSub?.unsubscribe();
  }

  selectProblema(p: Problema | null): void {
    this.selectedProblema = p;
    this.selectedProblemaId = p?.id ?? null;
    if (p && typeof (p as any)?.estadoId === 'number') {
      this.estadoProblemaId = (p as any).estadoId;
    }
  }

  onProblemaIdChange(problemaId: number | null): void {
    this.selectedProblemaId = problemaId ?? null;
    if (problemaId == null) {
      this.selectProblema(null);
      return;
    }
    const encontrado = this.problemas.find(pr => pr.id === problemaId) ?? null;
    this.selectProblema(encontrado);
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
      window.alert('No se pudo determinar el medico actual para la evolucion.');
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
      this.router.navigate(['/medico', 'paciente', this.pacienteId, 'evoluciones']);
    } catch (err) {
      console.error('No se pudo crear la evolucion', err);
      window.alert('Ocurrio un error al guardar la evolucion.');
    }
  }
  nuevoProblema(): void { this.router.navigate(['/medico', 'paciente', this.pacienteId, 'problemas', 'nuevo']); }

  onFechaHoraFocus(): void {
    this.updateFechaMaxima();
  }

  onFechaHoraChange(): void {
    this.enforceMaxFechaHora();
  }

  onFechaHoraInput(): void {
    this.enforceMaxFechaHora();
  }

  confirmarFechaHora(): void {
    this.updateFechaMaxima();
    this.enforceMaxFechaHora();
    const input = this.fechaHoraInput?.nativeElement;
    input?.blur();
  }

  currentMedicoNombre(): string {
    if (!this.medicoId) {
      return 'Medico no disponible';
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
        if (this.selectedProblemaId != null) {
          const existente = lista.find(p => p.id === this.selectedProblemaId);
          if (existente) {
            this.selectProblema(existente);
            return;
          }
        }
        if (lista.length) {
          this.selectProblema(lista[0]);
        } else {
          this.selectProblema(null);
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
    const usuarioActualId = this.utilidadSrv.obtenerUsuarioId();
    this.medicoSrv.lista().subscribe({
      next: resp => {
        const items: any[] = resp?.estado ? (resp.valor || []) : [];
        type MedicoListado = { id: number; nombre: string; usuarioId?: number };
        const normalizados = items
          .map<MedicoListado | null>(item => {
            const id = Number(item?.id ?? item?.Id);
            if (!Number.isFinite(id) || id <= 0) {
              return null;
            }
            const nombre = [
              item?.usuarioNombre ?? item?.UsuarioNombre ?? item?.nombre ?? item?.Nombre ?? '',
              item?.usuarioApellido ?? item?.UsuarioApellido ?? item?.apellido ?? item?.Apellido ?? ''
            ].filter(Boolean).join(' ').trim();
            const email = item?.usuarioMail ?? item?.UsuarioMail ?? '';
            const display = (nombre || email || `Medico ${id}`).toString();
            const medico: MedicoListado = { id, nombre: display };
            const usuarioId = Number(item?.usuarioId ?? item?.UsuarioId);
            if (Number.isFinite(usuarioId) && usuarioId > 0) {
              medico.usuarioId = usuarioId;
            }
            return medico;
          })
          .filter((v): v is MedicoListado => !!v);
        this.medicos = normalizados;

        const medicoSeleccionado = usuarioActualId
          ? this.medicos.find(m => m.usuarioId === usuarioActualId)
          : undefined;

        const nuevoMedicoId = medicoSeleccionado?.id ??
          (this.medicos.length === 1 ? this.medicos[0].id : undefined);

        if (nuevoMedicoId) {
          const cambio = this.medicoId !== nuevoMedicoId;
          this.medicoId = nuevoMedicoId;
          if (cambio) {
            this.loadPlantillas(nuevoMedicoId);
          }
        } else {
          this.medicoId = undefined;
          this.plantillas = [];
          this.plantillaId = undefined;
          this.resetPlantillaPreview();
          console.warn('No se encontró un medico asociado al usuario actual.');
        }
      },
      error: err => console.error('No se pudo cargar la lista de medicos', err)
    });
  }

  private loadPlantillas(medicoId: number): void {
    this.plantillaSrv.listaPorMedico(medicoId).subscribe({
      next: resp => {
        const items: Plantilla[] = resp?.estado ? (resp.valor || []) : [];
        const activas = items.filter(p => this.esPlantillaActiva(p));
        this.plantillas = activas;
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
  private esPlantillaActiva(plantilla: Plantilla): boolean {
    if (!plantilla) return false;
    const flag = (plantilla as any)?.activo;
    if (typeof flag === 'number') {
      return flag === 1;
    }
    if (typeof flag === 'string') {
      return flag === '1' || flag.toLowerCase() === 'true';
    }
    return !!flag;
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

  private updateFechaMaxima(): void {
    this.fechaMaxima = this.formatDateTime(new Date());
  }

  private enforceMaxFechaHora(): void {
    if (!this.fechaHora) {
      this.fechaHora = this.fechaMaxima;
      return;
    }
    const actual = new Date(this.fechaHora);
    const max = this.fechaMaxima ? new Date(this.fechaMaxima) : new Date();
    if (actual.getTime() > max.getTime()) {
      this.fechaHora = this.fechaMaxima;
    }
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
