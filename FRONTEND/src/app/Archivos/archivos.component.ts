import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { SharedModule } from '../reutilizable/shared/shared-module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of, switchMap, map } from 'rxjs';
import { EvolucionService } from '../services/evolucion.service';
import { EstudioService } from '../services/estudio.service';
import { ArchivoAdjuntoService } from '../services/archivo-adjunto.service';
import { TipoEstudioService } from '../services/tipo-estudio.service';
import { ResponseApi } from '../interfaces/response-api';
import { ArchivoAdjunto } from '../interfaces/archivoAdjunto';
import { Estudio } from '../interfaces/estudio';
import { PacienteService } from '../services/paciente.service';
import { Paciente } from '../interfaces/paciente';

type EvolucionItem = { id: number; descripcion?: string };
type TipoEstudioItem = { id: number; nombre: string };

@Component({
  standalone: true,
  selector: 'app-paciente-archivos',
  imports: [SharedModule, RouterModule],
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
    private pacienteSvc: PacienteService
  ) {}

  ngOnInit(): void {
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.loadAll();
    this.loadPaciente();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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

    this.sub = this.evolSvc.listaPorPaciente(this.pacienteId).pipe(
      switchMap((evoRes: ResponseApi) => {
        const evoItems: EvolucionItem[] = (evoRes?.valor || []).map((e: any) => ({ id: e.id, descripcion: e.descripcion }));
        this.evoluciones.set(evoItems);
        this.tipoSvc.lista().subscribe((res: ResponseApi) => {
          this.tiposEstudio.set((res?.valor || []).map((t: any) => ({ id: t.id, nombre: t.nombre })));
        });
        if (!evoItems.length) return of([] as Estudio[]);
        const estudioCalls = evoItems.map(e => this.estSvc.listaPorEvolucion(e.id));
        return forkJoin(estudioCalls).pipe(map((results: ResponseApi[]) => {
          const all: Estudio[] = results.flatMap(r => (r?.valor || []) as Estudio[]);
          return all;
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

  canUpload(): boolean {
    return !!this.form.evolucionId && !!this.form.tipoEstudioId && !!this.form.fecha && !!this.form.realizadoPor && this.selectedFiles().length > 0;
  }

  resetForm(): void {
    this.form = { evolucionId: null, tipoEstudioId: null, fecha: new Date().toISOString().slice(0,10), realizadoPor: '', observaciones: '' };
    this.selectedFiles.set([]);
  }

  upload(): void {
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
        const calls = this.selectedFiles().map(f => {
          const payload: ArchivoAdjunto = {
            id: 0,
            fechaSubida: new Date(),
            nombreArchivo: f.name,
            tamano: f.size,
            url: '',
            estudioId: creado.id,
            activo: 1
          } as unknown as ArchivoAdjunto;
          return this.archSvc.crear(payload);
        });
        return calls.length ? forkJoin(calls) : of([]);
      })
    ).subscribe({
      next: () => {
        this.resetForm();
        this.loadAll();
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


