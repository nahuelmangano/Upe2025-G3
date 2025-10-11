import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MOCK_RESUMEN } from '../mock/mock-data';

type ApiResponse<T> = {
  estado?: boolean;
  valor?: T;
  mensaje?: string;
  Estado?: boolean;
  Valor?: T;
  Mensaje?: string;
};

export interface ResumenProblema {
  titulo?: string;
  tipo?: string;
  activo?: boolean;
}

export interface ResumenEvolucion {
  fecha?: string;
  hora?: string;
  titulo?: string;
  descripcion?: string;
}

export interface ResumenPaciente {
  problemas: ResumenProblema[];
  evoluciones: ResumenEvolucion[];
}

interface EvolucionApiResponse {
  estado?: boolean;
  valor?: EvolucionApi[];
  mensaje?: string;
  Estado?: boolean;
  Valor?: EvolucionApi[];
  Mensaje?: string;
}

interface EvolucionApi {
  id: number;
  descripcion?: string;
  fechaConsulta?: string;
  diagnosticoInicial?: string;
  diagnosticoDefinitivo?: string;
  problemaId?: number;
  problemaTitulo?: string;
  estadoProblemaNombre?: string;
}

@Injectable({providedIn:'root'})
export class ApiService{
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient){}
  getResumenPaciente(pacienteId:number):Observable<ResumenPaciente>{
    if(environment.useMock) return of(MOCK_RESUMEN);

    return this.http
      .get<ApiResponse<ResumenPaciente>>(`${this.base}/Paciente/Resumen/${pacienteId}`)
      .pipe(
        map(response => {
          const ok = response?.estado ?? response?.Estado ?? false;
          const data = response?.valor ?? response?.Valor;
          if (ok && data) {
            const anyData = data as any;
            return {
              problemas: anyData?.problemas ?? anyData?.Problemas ?? [],
              evoluciones: anyData?.evoluciones ?? anyData?.Evoluciones ?? []
            };
          }
          return this.emptyResumen();
        }),
        switchMap(resumen => {
          if (resumen.problemas.length || resumen.evoluciones.length) {
            return of(resumen);
          }
          return this.http
            .get<EvolucionApiResponse>(`${this.base}/Evolucion/ListaPorPaciente/${pacienteId}`)
            .pipe(
              map(resp => {
                const lista = resp?.valor ?? resp?.Valor ?? [];
                const ok = resp?.estado ?? resp?.Estado ?? true;
                return ok ? this.mapEvolucionesToResumen(lista) : this.emptyResumen();
              }),
              catchError(() => of(this.emptyResumen()))
            );
        }),
        catchError(() => of(this.emptyResumen()))
      );
  }

  private mapEvolucionesToResumen(items: EvolucionApi[] | undefined): ResumenPaciente {
    if (!items || !items.length) {
      return this.emptyResumen();
    }

    const evoluciones: ResumenEvolucion[] = items.map(item => {
      const fecha = this.parseFecha(item.fechaConsulta);
      return {
        fecha: fecha ? this.formatFecha(fecha) : item.fechaConsulta ?? '',
        hora: fecha ? this.formatHora(fecha) : '',
        titulo: item.problemaTitulo || item.diagnosticoInicial || '',
        descripcion: item.descripcion || item.diagnosticoInicial || item.diagnosticoDefinitivo || ''
      };
    });

    const problemasMap = new Map<number | string, ResumenProblema>();
    items.forEach(item => {
      const key = item.problemaId ?? item.problemaTitulo ?? item.diagnosticoInicial ?? item.id;
      const descripcion = item.descripcion || item.diagnosticoInicial || item.diagnosticoDefinitivo || '';
      if (!problemasMap.has(key)) {
        problemasMap.set(key, {
          titulo: descripcion || item.problemaTitulo || '—',
          tipo: item.problemaTitulo || item.diagnosticoInicial || '',
          activo: (item.estadoProblemaNombre ?? '').toLowerCase() === 'activo'
        });
      }
    });

    return {
      problemas: Array.from(problemasMap.values()),
      evoluciones
    };
  }

  private emptyResumen(): ResumenPaciente {
    return { problemas: [], evoluciones: [] };
  }

  private parseFecha(raw?: string): Date | null {
    if (!raw) { return null; }
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
    const parts = raw.split('/');
    if (parts.length === 3) {
      const [dia, mes, anio] = parts.map(p => parseInt(p, 10));
      if (!Number.isNaN(dia) && !Number.isNaN(mes) && !Number.isNaN(anio)) {
        return new Date(anio, mes - 1, dia);
      }
    }
    return null;
  }

  private formatFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  private formatHora(fecha: Date): string {
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos} hs`;
  }
}
