import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of, switchMap, map } from 'rxjs';
import { EvolucionService } from '../../services/evolucion.service';
import { EstudioService } from '../../services/estudio.service';
import { ArchivoAdjuntoService } from '../../services/archivo-adjunto.service';
import { TipoEstudioService } from '../../services/tipo-estudio.service';
import { ResponseApi } from '../../interfaces/response-api';
import { ArchivoAdjunto } from '../../interfaces/archivoAdjunto';
import { Estudio } from '../../interfaces/estudio';

type EvolucionItem = { id: number; descripcion?: string };
type TipoEstudioItem = { id: number; nombre: string };

@Component({
  standalone: true,
  selector: 'app-paciente-archivos',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card" style="margin-bottom:12px">
      <h3 class="h3" style="margin-bottom:12px">Archivos del paciente</h3>

      <div *ngIf="loading()">Cargando archivos...</div>
      <div *ngIf="error()" style="color:#d63031">{{ error() }}</div>

      <ng-container *ngIf="!loading() && !error()">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo de documento</th>
                <th>Fecha subida</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of archivos()">
                <td>
                  <input [(ngModel)]="a.nombreArchivo" [readonly]="a.__readonly" style="width:100%"/>
                </td>
                <td>{{ a.estudioTipoNombre || '—' }}</td>
                <td>{{ a.fechaSubida || '—' }}</td>
                <td>
                  <button class="btn-outline" (click)="toggleEdit(a)">{{ a.__readonly ? 'Editar' : 'Cancelar' }}</button>
                  <button class="btn" [disabled]="a.__readonly" (click)="saveEdit(a)">Guardar</button>
                  <button class="btn-outline" (click)="remove(a)">Borrar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </div>

    <div class="card">
      <h3 class="h3" style="margin-bottom:12px">Cargar documento</h3>

      <form (ngSubmit)="upload()" style="display:grid;gap:10px">
        <div class="modal-grid">
          <label>
            <span>Evolución</span>
            <select [(ngModel)]="form.evolucionId" name="evolucionId" required>
              <option [ngValue]="null">Seleccione…</option>
              <option *ngFor="let e of evoluciones()" [ngValue]="e.id">{{ e.descripcion || ('Evolución #' + e.id) }}</option>
            </select>
          </label>
          <label>
            <span>Tipo de estudio</span>
            <select [(ngModel)]="form.tipoEstudioId" name="tipoEstudioId" required>
              <option [ngValue]="null">Seleccione…</option>
              <option *ngFor="let t of tiposEstudio()" [ngValue]="t.id">{{ t.nombre }}</option>
            </select>
          </label>
          <label>
            <span>Fecha</span>
            <input type="date" [(ngModel)]="form.fecha" name="fecha" required />
          </label>
          <label>
            <span>Realizado por</span>
            <input [(ngModel)]="form.realizadoPor" name="realizadoPor" required />
          </label>
          <label class="full">
            <span>Observaciones</span>
            <input [(ngModel)]="form.observaciones" name="observaciones" />
          </label>
          <label class="full">
            <span>Seleccionar archivos</span>
            <input type="file" (change)="onFiles($event)" multiple accept=".jpg,.jpeg,.png,.pdf,.bmp,.gif" />
          </label>
        </div>

        <div *ngIf="selectedFiles().length" class="table-wrap">
          <table class="table">
            <thead><tr><th>Archivo</th><th>Tamaño</th></tr></thead>
            <tbody>
              <tr *ngFor="let f of selectedFiles()"><td>{{ f.name }}</td><td>{{ f.size | number }} bytes</td></tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn-outline" type="button" (click)="resetForm()">Cancelar</button>
          <button class="btn" type="button" (click)="upload()" [disabled]="!canUpload()">Guardar</button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `.modal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
     .modal-grid .full{grid-column:1/-1}`
  ]
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
    private tipoSvc: TipoEstudioService
  ) {}

  ngOnInit(): void {
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadAll(): void {
    this.loading.set(true);
    this.error.set('');

    // 1) Evoluciones del paciente
    this.sub = this.evolSvc.listaPorPaciente(this.pacienteId).pipe(
      switchMap((evoRes: ResponseApi) => {
        const evoItems: EvolucionItem[] = (evoRes?.valor || []).map((e: any) => ({ id: e.id, descripcion: e.descripcion }));
        this.evoluciones.set(evoItems);
        // 2) Tipos de estudio (independiente)
        this.tipoSvc.lista().subscribe((res: ResponseApi) => {
          this.tiposEstudio.set((res?.valor || []).map((t: any) => ({ id: t.id, nombre: t.nombre })));
        });
        if (!evoItems.length) return of([] as Estudio[]);
        // 3) Estudios por evolución (forkJoin)
        const estudioCalls = evoItems.map(e => this.estSvc.listaPorEvolucion(e.id));
        return forkJoin(estudioCalls).pipe(map((results: ResponseApi[]) => {
          const all: Estudio[] = results.flatMap(r => (r?.valor || []) as Estudio[]);
          return all;
        }));
      }),
      switchMap((estudios: Estudio[]) => {
        if (!estudios.length) return of([] as (ArchivoAdjunto & { __readonly: boolean })[]);
        // 4) Archivos por estudio (forkJoin)
        const archivoCalls = estudios.map(es => this.archSvc.listaPorEstudio(es.id));
        return forkJoin(archivoCalls).pipe(map((results: ResponseApi[]) => {
          const all = results.flatMap(r => (r?.valor || []) as ArchivoAdjunto[]);
          return all.map(a => ({ ...a, __readonly: true }));
        }));
      })
    ).subscribe({
      next: (archs) => {
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
    // Primero crear Estudio, luego crear un ArchivoAdjunto por cada archivo seleccionado.
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


