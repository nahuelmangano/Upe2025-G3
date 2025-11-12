import { Component, OnDestroy, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
import { SHARED_IMPORTS } from '@shared/shared-imports';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of, switchMap, map } from 'rxjs';
import { EvolucionService } from '@features/paciente/services/evolucion.service';
import { EstudioService } from '@features/estudio/services/estudio.service';
import { ArchivoAdjuntoService } from '@features/paciente/services/archivo-adjunto.service';
import { TipoEstudioService } from '@features/estudio/services/tipo-estudio.service';
import { ResponseApi } from '@core/interfaces/response-api';
import { ArchivoAdjunto } from '@features/paciente/interfaces/archivoAdjunto';
import { Estudio } from '@features/estudio/interfaces/estudio';
import { PacienteService } from '@features/paciente/services/paciente.service';
import { Paciente } from '@features/paciente/interfaces/paciente';
import { UtilidadService } from '@core/services/utilidad.service';

type EvolucionItem = { id: number; descripcion?: string };
type TipoEstudioItem = { id: number; nombre: string };

@Component({
  standalone: true,
  selector: 'app-paciente-archivos',
  imports: [ ...SHARED_IMPORTS, RouterModule ],
  templateUrl: './archivos.component.html',
  styleUrls: ['./archivos.component.css']
})
export class ArchivosComponent implements OnInit, OnDestroy {
  pacienteId = 0;
  sub?: Subscription;

  loading = signal<boolean>(false);
  error = signal<string>('');

  evoluciones = signal<EvolucionItem[]>([]);
  tiposEstudio = signal<TipoEstudioItem[]>([]);
  archivos = signal<(ArchivoAdjunto & { __readonly: boolean })[]>([]);

  selectedFiles = signal<File[]>([]);
  evolucionSeleccionadaId = signal<number | null>(null);
  tipoPorEvolucion: { [evolucionId: number]: number | null } = {};

  form = {
    evolucionId: null as number | null,
    tipoEstudioId: null as number | null,
    fecha: new Date().toISOString().slice(0,10),
    realizadoPor: '',
    observaciones: ''
  };

  constructor(
    private route: ActivatedRoute,
    private evolSvc: EvolucionService,
    private estSvc: EstudioService,
    private archSvc: ArchivoAdjuntoService,
    private tipoSvc: TipoEstudioService,
    private pacienteSvc: PacienteService,
    private cdr: ChangeDetectorRef,
    private util: UtilidadService
  ) {}

  ngOnInit(): void {
    // Prefijar "Realizado por" con el nombre del usuario actual y mantenerlo luego de cada carga
    this.form.realizadoPor = this.util.obtenerNombreCompletoUsuario() || '';
    // Suscribirse a cambios de ruta por si se navega entre pacientes sin recrear el componente
    this.sub = this.route.paramMap.subscribe(pm => {
      const idFromPm = pm.get('id');
      this.pacienteId = idFromPm && !Number.isNaN(Number(idFromPm)) ? Number(idFromPm) : this.resolvePacienteId();
      this.loadAll();
      this.loadPaciente();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private resolvePacienteId(): number {
    let r: ActivatedRoute | null = this.route;
    while (r) {
      const v = r.snapshot.paramMap.get('id');
      if (v && !Number.isNaN(Number(v))) return Number(v);
      r = r.parent as ActivatedRoute | null;
    }
    return 0;
  }

  // Cabecera lateral con datos del paciente, similar a otras páginas
  paciente?: Paciente | null;
  private loadPaciente(): void {
    if (!this.pacienteId) return;
    this.pacienteSvc.obtener(this.pacienteId).subscribe(p => this.paciente = p);
  }

  private loadAll(): void {
    this.loading.set(true);
    this.error.set('');

    // Cargar tipos de estudio en paralelo e independiente de evoluciones
    this.tipoSvc.lista().subscribe({
      next: (res: ResponseApi) => {
        const raw: any = res as any;
        const valor = raw?.estado === true ? (Array.isArray(raw?.valor) ? raw.valor : (Array.isArray(raw?.Valor) ? raw.Valor : [])) : [];
        const arr = Array.isArray(valor) ? valor : [];
        this.tiposEstudio.set(arr.map((t: any) => ({ id: (t?.id ?? t?.Id), nombre: (t?.nombre ?? t?.Nombre) }))); 
        console.log('[Archivos] tipos estudio', this.tiposEstudio());
        this.cdr.detectChanges();
      },
      error: () => {
        this.tiposEstudio.set([]);
        console.log('[Archivos] tipos estudio error');
        this.cdr.detectChanges();
      }
    });

    this.sub = this.evolSvc.listaPorPaciente(this.pacienteId).pipe(
      switchMap((evoRes: ResponseApi) => {
        const raw: any = evoRes as any;
        const valor = raw?.estado === true ? (Array.isArray(raw?.valor) ? raw.valor : (Array.isArray(raw?.Valor) ? raw.Valor : [])) : [];
        const arr = Array.isArray(valor) ? valor : [];
        const evoItems: EvolucionItem[] = arr.map((e: any) => ({ id: (e?.id ?? e?.Id), descripcion: (e?.descripcion ?? e?.Descripcion ?? e?.diagnosticoInicial ?? e?.DiagnosticoInicial) }));
        this.evoluciones.set(evoItems);
        console.log('[Archivos] evoluciones', this.evoluciones());
        this.cdr.detectChanges();
        // Inicializar tipo seleccionado por cada evolución en null
        evoItems.forEach(it => { if (this.tipoPorEvolucion[it.id] === undefined) this.tipoPorEvolucion[it.id] = null; });
        if (!evoItems.length) return of([] as Estudio[]);
        const estudioCalls = evoItems.map(e => this.estSvc.listaPorEvolucion(e.id));
        return forkJoin(estudioCalls).pipe(map((results: ResponseApi[]) => {
          const all = results.flatMap(r => {
            const rr: any = r as any;
            const v = Array.isArray(rr?.valor) ? rr.valor : (Array.isArray(rr?.Valor) ? rr.Valor : []);
            return Array.isArray(v) ? v : [];
          });
          return all.map(es => ({ ...es, id: (es?.id ?? es?.Id) })) as Estudio[];
        }));
      }),
      switchMap((estudios: Estudio[]) => {
        if (!estudios.length) return of([] as (ArchivoAdjunto & { __readonly: boolean })[]);
        const archivoCalls = estudios.map(es => this.archSvc.listaPorEstudio(es.id));
        return forkJoin(archivoCalls).pipe(map((results: ResponseApi[]) => {
          const all = results.flatMap(r => (r?.valor || []) as ArchivoAdjunto[]);
          return all.map(a => ({ ...a, __readonly: true }));
        }));
      })
    ).subscribe({
      next: (archs: (ArchivoAdjunto & { __readonly: boolean })[]) => {
        this.archivos.set(archs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los archivos');
        this.loading.set(false);
      }
    });
  }

  onFiles(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.selectedFiles.set(files);
  }

  archivosSeleccionLabel(): string {
    const n = this.selectedFiles().length;
    if (n === 0) return 'Ningún archivo seleccionado';
    return n === 1 ? '1 archivo seleccionado' : `${n} archivos seleccionados`;
  }

  seleccionarEvolucion(evolucionId: number | null): void {
    this.evolucionSeleccionadaId.set(evolucionId);
    this.form.evolucionId = evolucionId as any;
    const tipo = (evolucionId ? this.tipoPorEvolucion[evolucionId] : null) ?? null;
    this.form.tipoEstudioId = tipo as any;
  }

  onTipoChange(evolucionId: number, tipoId: number | null): void {
    this.tipoPorEvolucion[evolucionId] = tipoId ?? null;
    if (this.evolucionSeleccionadaId() === evolucionId) {
      this.form.tipoEstudioId = tipoId as any;
    }
  }

  canUpload(): boolean {
    return !!this.form.evolucionId && !!this.form.tipoEstudioId && !!this.form.fecha && !!this.form.realizadoPor && this.selectedFiles().length > 0;
  }

  resetForm(): void {
    // Mantener el "Realizado por" con el usuario actual para evitar validación en rojo
    const realizadoPor = this.util.obtenerNombreCompletoUsuario() || this.form.realizadoPor || '';
    this.form = { evolucionId: null, tipoEstudioId: null, fecha: new Date().toISOString().slice(0,10), realizadoPor, observaciones: '' };
    this.selectedFiles.set([]);
    this.evolucionSeleccionadaId.set(null);
  }

  upload(): void {
    // Resolver selección desde la lista (radio + tipo)
    const evoId = this.evolucionSeleccionadaId() ?? this.form.evolucionId;
    const tipoId = (evoId ? (this.tipoPorEvolucion[evoId] ?? null) : null) ?? this.form.tipoEstudioId;
    this.form.evolucionId = evoId as any;
    this.form.tipoEstudioId = tipoId as any;
    if (!this.canUpload()) return;
    const estudioPayload: Estudio = {
      id: 0,
      fecha: new Date(this.form.fecha),
      realizadoPor: this.form.realizadoPor,
      resultado: null,
      observaciones: this.form.observaciones,
      tipoEstudioId: this.form.tipoEstudioId!,
      evolucionId: this.form.evolucionId!
    } as unknown as Estudio;

    this.estSvc.crear(estudioPayload).pipe(
      switchMap((res: ResponseApi) => {
        const creado: Estudio = res?.valor as Estudio;
        if (!creado || !creado.id) return of([]);
        const calls = this.selectedFiles().map(f => this.archSvc.subir(creado.id, f));
        return calls.length ? forkJoin(calls) : of([]);
      })
    ).subscribe({
      next: () => {
        this.resetForm();
        this.loadAll();
        this.util.mostrarAlerta('Archivo(s) cargado(s) con éxito', 'Ok');
      },
      error: () => {
        this.error.set('No se pudo cargar el documento');
      }
    });
  }

  toggleEdit(a: any): void {
    a.__readonly = !a.__readonly;
  }

  saveEdit(a: ArchivoAdjunto & { __readonly: boolean }): void {
    const payload: ArchivoAdjunto = { ...a } as any;
    this.archSvc.editar(payload).subscribe(() => {
      a.__readonly = true;
    });
  }

  remove(a: ArchivoAdjunto): void {
    if (!confirm('¿Eliminar el archivo "' + a.nombreArchivo + '"?')) return;
    this.archSvc.eliminar(a.id).subscribe(() => {
      this.archivos.set(this.archivos().filter(x => x.id !== a.id));
    });
  }
}


