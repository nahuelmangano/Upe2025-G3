import { Component, OnDestroy, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
import { SHARED_IMPORTS } from '@shared/shared-imports';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of, switchMap, map } from 'rxjs';
import { EvolucionService } from '@features/paciente/services/evolucion.service';
import { EstudioService } from '@features/estudio/services/estudio.service';
import { TipoEstudioService } from '@features/estudio/services/tipo-estudio.service';
import { ResponseApi } from '@core/interfaces/response-api';
import { Estudio } from '@features/estudio/interfaces/estudio';
import { PacienteService } from '@features/paciente/services/paciente.service';
import { Paciente } from '@features/paciente/interfaces/paciente';
import { UtilidadService } from '@core/services/utilidad.service';
import { RolPermiso } from '@core/interfaces/rol-permiso';
import { RolPermisoService } from '@core/services/rol-permiso.service';

type EvolucionItem = { id: number; descripcion?: string };
type TipoEstudioItem = { id: number; nombre: string };

@Component({
  standalone: true,
  selector: 'app-paciente-archivos',
  imports: [...SHARED_IMPORTS, RouterModule],
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
  estudiosPaciente = signal<{ id: number; tipo: string; fecha: string; profesional: string }[]>([]);

  // paginación
  page = 0;
  pageSize = 5;

  constructor(
    private route: ActivatedRoute,
    private evolSvc: EvolucionService,
    private estSvc: EstudioService,
    private tipoSvc: TipoEstudioService,
    private pacienteSvc: PacienteService,
    private cdr: ChangeDetectorRef,
    private util: UtilidadService,
    private rolPermisoServicio: RolPermisoService
  ) { }

  ngOnInit(): void {
    // Suscribirse a cambios de ruta por si se navega entre pacientes sin recrear el componente
    this.sub = this.route.paramMap.subscribe(pm => {
      const idFromPm = pm.get('id');
      this.pacienteId = idFromPm && !Number.isNaN(Number(idFromPm)) ? Number(idFromPm) : this.resolvePacienteId();
      this.loadAll();
      this.loadPaciente();
    });

    this.cargarRolPermisoServicio();
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

  cargarRolPermisoServicio() {
    this.rolPermisoServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.util.dataListaRolesPermisos = data.valor;

        } else {
          this.util.mostrarAlerta(data.mensaje, "Opps!");
        }
      }
    });
  }

  ngAfterViewInit(): void {
    const boton = document.getElementById('botonArchivo');
    if (boton) {
      boton.addEventListener('click', (event) => {
        if (!this.util.tienePermiso("Subir Archivo", 2)) {
          event.preventDefault();
          event.stopPropagation();

          this.util.mostrarAlerta("No tienes permiso para subir archivos", "Acceso denegado");
          return;
        }
      }, true); 
    }
  }

  private loadAll(): void {
    this.loading.set(true);
    this.error.set('');

    this.tipoSvc.lista().subscribe({
      next: (res: ResponseApi) => {
        const raw: any = res as any;
        const valor = raw?.estado === true ? (Array.isArray(raw?.valor) ? raw.valor : (Array.isArray(raw?.Valor) ? raw.Valor : [])) : [];
        const arr = Array.isArray(valor) ? valor : [];
        this.tiposEstudio.set(arr.map((t: any) => ({ id: (t?.id ?? t?.Id), nombre: (t?.nombre ?? t?.Nombre) })));
        this.cdr.detectChanges();
      },
      error: () => {
        this.tiposEstudio.set([]);
        this.cdr.detectChanges();
      }
    });

    this.sub = this.evolSvc.listaPorPaciente(this.pacienteId).pipe(
      switchMap((evoRes: ResponseApi) => {
        const raw: any = evoRes as any;
        const valor = raw?.estado === true ? (Array.isArray(raw?.valor) ? raw.valor : (Array.isArray(raw?.Valor) ? raw.Valor : [])) : [];
        const evols = Array.isArray(valor) ? valor : [];
        if (!evols.length) return of([] as { id: number; tipo: string; fecha: string; profesional: string }[]);
        const estudioCalls = evols.map(e => this.estSvc.listaPorEvolucion(Number(e?.id ?? e?.Id ?? 0)));
        return forkJoin(estudioCalls).pipe(map((results: ResponseApi[]) => {
          const all = results.flatMap(r => {
            const rr: any = r as any;
            const v = Array.isArray(rr?.valor) ? rr.valor : (Array.isArray(rr?.Valor) ? rr.Valor : []);
            return Array.isArray(v) ? v : [];
          }) as any[];
          const mapped: { id: number; tipo: string; fecha: string; profesional: string }[] = all.map(es => ({
            id: Number(es?.id ?? es?.Id ?? 0),
            // Intentamos resolver el nombre del tipo aun si el servicio no lo trae
            tipo: (() => {
              const direct = (es?.tipoEstudioNombre ?? es?.TipoEstudioNombre);
              if (typeof direct === 'string' && direct.trim()) return String(direct);
              const tipoId = Number(es?.tipoEstudioId ?? es?.TipoEstudioId ?? 0);
              if (Number.isFinite(tipoId) && tipoId > 0) {
                const match = this.tiposEstudio().find(t => t.id === tipoId);
                if (match?.nombre) return match.nombre;
              }
              return '—';
            })(),
            fecha: es?.fecha ? new Date(es.fecha).toISOString() : '',
            profesional: String(es?.realizadoPor ?? es?.RealizadoPor ?? '—')
          }));
          return mapped;
        }));
      })
    ).subscribe({
      next: (lista: { id: number; tipo: string; fecha: string; profesional: string }[]) => {
        // Ordenar por fecha desc (más reciente primero)
        const sorted = (lista || []).sort((a, b) => (Date.parse(b.fecha || '') || 0) - (Date.parse(a.fecha || '') || 0));
        this.estudiosPaciente.set(sorted);
        this.page = 0;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los estudios');
        this.loading.set(false);
      }
    });
  }

  // Helpers de paginación (mismo comportamiento que Evoluciones)
  pagesCount(): number {
    const t = this.estudiosPaciente().length;
    return Math.max(1, Math.ceil(t / this.pageSize));
  }
  pageItems(): { id: number; tipo: string; fecha: string; profesional: string }[] {
    const data = this.estudiosPaciente();
    const s = this.page * this.pageSize;
    return data.slice(s, s + this.pageSize);
  }
  rangeLabel(): string {
    const t = this.estudiosPaciente().length;
    const s = t ? this.page * this.pageSize + 1 : 0;
    const e = Math.min(t, (this.page + 1) * this.pageSize);
    return `${s} - ${e} of ${t}`;
  }
  prev(): void { if (this.page > 0) this.page--; }
  next(): void { if ((this.page + 1) < this.pagesCount()) this.page++; }
}


