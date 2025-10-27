import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvolucionService } from '../../services/evolucion.service';
import { ProblemaService } from '../../services/problema.service';
import { MedicoService } from '../../services/medico.service';
import { EstadoProblemaService } from '../../services/estado-problema.service';

interface ProblemaRow {
  id: number;
  problema: string;
  estado: string;
  diagnosticoInicial: string;
  diagnosticoFinal?: string;
  descripcion?: string;
}

interface EvolucionRow {
  id: number;
  problema: string;
  diagnosticoInicial: string;
  medico: string;
}

interface DiagnosticoDefinitivo {
  problema: string;
  diagnosticoFinal: string;
}

@Component({
  standalone: true,
  selector: 'app-resumen-usuario',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card" style="margin-bottom:12px">
      <h3 class="h3" style="margin-bottom:12px">Resumen del Paciente</h3>

      <div *ngIf="loading">Cargando datos...</div>
      <div *ngIf="error" style="color:#d63031">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <!-- Sección izquierda: Problemas -->
          <div class="card">
            <h4 style="margin-bottom:12px;color:#4b5563">Últimos 4 Problemas</h4>
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Problema</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of problemas">
                    <td>{{ p.problema }}</td>
                    <td>
                      <span [class]="'estado-badge ' + getEstadoClass(p.estado)">
                        {{ p.estado }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="problemas.length === 0">
                    <td colspan="2" style="text-align:center;color:#9ca3af">No hay problemas registrados</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Sección derecha: Evoluciones -->
          <div class="card">
            <h4 style="margin-bottom:12px;color:#4b5563">Últimas 4 Evoluciones</h4>
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Problema</th>
                    <th>Diagnóstico Inicial</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let e of evoluciones">
                    <td>{{ e.problema }}</td>
                    <td>{{ e.diagnosticoInicial }}</td>
                  </tr>
                  <tr *ngIf="evoluciones.length === 0">
                    <td colspan="2" style="text-align:center;color:#9ca3af">No hay evoluciones registradas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sección inferior: Diagnóstico Definitivo -->
        <div class="card">
          <h4 style="margin-bottom:12px;color:#4b5563">Últimos 4 Diagnósticos Definitivos</h4>
          <div style="display:grid;gap:12px">
            <div *ngFor="let d of diagnosticosDefinitivos" style="padding:12px;background:#f9fafb;border-radius:8px">
              <div style="font-weight:600;margin-bottom:8px">{{ d.problema }}</div>
              <div style="color:#6b7280;font-size:14px">
                <strong>Diagnóstico Final:</strong> {{ d.diagnosticoFinal }}
              </div>
            </div>
            <div *ngIf="diagnosticosDefinitivos.length === 0" style="text-align:center;color:#9ca3af;padding:20px">
              No hay diagnósticos definitivos registrados
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `.card{
      background:#fff;padding:20px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);
    }
    .table-wrap{overflow-x:auto;}
    .table{width:100%;border-collapse:collapse;font-size:14px;}
    .table th{background:#f9fafb;padding:12px;text-align:left;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb;}
    .table td{padding:12px;border-bottom:1px solid #e5e7eb;}
    .table tbody tr:nth-child(odd){background:#ffffff;}
    .table tbody tr:nth-child(even){background:#f5f6f8;}
    .h3{font-size:20px;font-weight:600;color:#111827;margin:0;}
    .h4{font-size:16px;font-weight:600;color:#374151;margin:0;}
    .estado-badge{
      display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;
      border:none;cursor:default;user-select:none;
    }
    .estado-badge.estado-nuevo{background:#3b82f6;color:#fff;}
    .estado-badge.estado-estable{background:#e5e7eb;color:#374151;}
    .estado-badge.estado-mejorando{background:#10b981;color:#fff;}
    .estado-badge.estado-recurrente{background:#fbbf24;color:#fff;}
    .estado-badge.estado-cronico{background:#ef4444;color:#fff;}
    .estado-badge.estado-default{background:#d1d5db;color:#374151;}`
  ]
})
export class ResumenUsuarioComponent implements OnInit, OnDestroy {
  pacienteId = 0;
  sub?: Subscription;

  problemas: ProblemaRow[] = [];
  evoluciones: EvolucionRow[] = [];
  diagnosticosDefinitivos: DiagnosticoDefinitivo[] = [];
  loading = false;
  error = '';
  
  private problemaMap = new Map<number, string>();
  private medicoMap = new Map<number, string>();
  private estadoMap = new Map<number, string>();

  constructor(
    private route: ActivatedRoute,
    private evolucionService: EvolucionService,
    private problemaService: ProblemaService,
    private medicoService: MedicoService,
    private estadoService: EstadoProblemaService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadData(): void {
    this.loading = true;
    this.error = '';
    
    const catalogos$ = this.loadCatalogs();
    catalogos$.subscribe({
      next: () => {
        forkJoin({
          problemas: this.problemaService.listaPorPaciente(this.pacienteId).pipe(
            catchError(() => of({ estado: false, valor: [] }))
          ),
          evoluciones: this.evolucionService.listaPorPaciente(this.pacienteId).pipe(
            catchError(() => of({ estado: false, valor: [] }))
          )
        }).subscribe({
          next: ({ problemas, evoluciones }) => {
            this.evoluciones = this.mapEvoluciones(evoluciones.valor || []);
            this.problemas = this.mapProblemas(evoluciones.valor || []);
            this.diagnosticosDefinitivos = this.mapDiagnosticosDefinitivos(evoluciones.valor || []);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.error = 'No se pudieron cargar los datos';
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los catálogos';
      }
    });
  }

  private loadCatalogs() {
    return forkJoin({
      problemas: this.problemaService.lista().pipe(
        catchError(() => of({ estado: false, valor: [] }))
      ),
      medicos: this.medicoService.lista().pipe(
        catchError(() => of({ estado: false, valor: [] }))
      ),
      estados: this.estadoService.lista().pipe(
        catchError(() => of({ estado: false, valor: [] }))
      )
    }).pipe(
      catchError(() => of({ problemas: { estado: false, valor: [] }, medicos: { estado: false, valor: [] }, estados: { estado: false, valor: [] } }))
    );
  }

  private mapProblemas(items: any[]): ProblemaRow[] {
    // Extraer problemas únicos desde evoluciones, tomando los últimos por ID
    const problemasUnicos = new Map<number, ProblemaRow>();
    
    items.forEach(item => {
      const problemaNombre = item?.problemaTitulo ?? item?.ProblemaTitulo ?? item?.problemaNombre ?? item?.ProblemaNombre ?? '-';
      const estadoNombre = item?.estadoProblemaNombre ?? item?.EstadoProblemaNombre ?? '-';
      const diagnosticoInicial = item?.diagnosticoInicial ?? item?.DiagnosticoInicial ?? '-';
      const diagnosticoFinal = item?.diagnosticoDefinitivo ?? item?.DiagnosticoDefinitivo;
      
      // Usar el problemaId como clave única
      const problemaId = Number(item?.problemaId ?? item?.ProblemaId);
      
      if (problemaId) {
        // Siempre actualizar con el último
        problemasUnicos.set(problemaId, {
          id: problemaId,
          problema: problemaNombre,
          estado: estadoNombre,
          diagnosticoInicial: diagnosticoInicial,
          diagnosticoFinal: diagnosticoFinal,
          descripcion: item?.descripcion ?? item?.Descripcion
        });
      }
    });
    
    // Ordenar por ID descendente y tomar los últimos 4
    return Array.from(problemasUnicos.values())
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
  }

  private mapEvoluciones(items: any[]): EvolucionRow[] {
    return items
      .map(item => ({
        id: item?.id ?? 0,
        problema: item?.problemaTitulo ?? item?.ProblemaTitulo ?? item?.problemaNombre ?? item?.ProblemaNombre ?? '-',
        diagnosticoInicial: item?.diagnosticoInicial ?? item?.DiagnosticoInicial ?? '-',
        medico: item?.medicoNombre ?? item?.MedicoNombre ?? '-'
      }))
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
  }

  private mapDiagnosticosDefinitivos(items: any[]): DiagnosticoDefinitivo[] {
    return items
      .filter(item => {
        const diagnosticoFinal = item?.diagnosticoDefinitivo ?? item?.DiagnosticoDefinitivo;
        return diagnosticoFinal && diagnosticoFinal.trim() !== '';
      })
      .map(item => ({
        problema: item?.problemaTitulo ?? item?.ProblemaTitulo ?? item?.problemaNombre ?? item?.ProblemaNombre ?? '-',
        diagnosticoFinal: item?.diagnosticoDefinitivo ?? item?.DiagnosticoDefinitivo ?? ''
      }))
      .slice(0, 4);
  }

  getEstadoClass(estado: string): string {
    const estadoLower = estado.toLowerCase().trim();
    if (estadoLower === 'nuevo') return 'estado-nuevo';
    if (estadoLower === 'estable') return 'estado-estable';
    if (estadoLower === 'mejorando') return 'estado-mejorando';
    if (estadoLower === 'recurrente') return 'estado-recurrente';
    if (estadoLower === 'cronico' || estadoLower === 'crónico') return 'estado-cronico';
    return 'estado-default';
  }
}

