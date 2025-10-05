import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Evolucion {
  id: number;
  problema?: string;
  paciente?: string;
  diagnosticoInicial: string;
  diagnosticoFinal?: string;
  medico?: string;
  estado?: string;
  fecha?: string; // ISO
}

export interface EvolucionInput {
  descripcion?: string;
  fechaConsulta: string; // ISO
  diagnosticoInicial: string;
  diagnosticoDefinitivo?: string;
  pacienteId: number;
  problemaId?: number;
  estadoProblemaId?: number;
  medicoId?: number;
  plantillaId?: number;
}

interface ApiResponse<T> { estado: boolean; valor: T; mensaje?: string; }
interface EvolucionApi {
  id: number;
  descripcion?: string;
  fechaConsulta: string;
  diagnosticoInicial: string;
  diagnosticoDefinitivo?: string;
  pacienteId: number;
  pacienteNombre?: string;
  plantillaId?: number;
  plantillaNombre?: string;
  problemaId?: number;
  problemaTitulo?: string;
  estadoProblemaId?: number;
  estadoProblemaNombre?: string;
  medicoId?: number;
  medicoNombre?: string;
}

const MOCK: Evolucion[] = [
  { id: 1, problema: 'Chequeo', paciente: 'Ian Guya', diagnosticoInicial: 'asnkasnc', diagnosticoFinal: 'asnkasnc', medico: 'Patricio Lara', estado: 'Activo', fecha: new Date().toISOString() },
  { id: 2, problema: 'Dolor lumbar', paciente: 'Ian Guya', diagnosticoInicial: 'Contractura', diagnosticoFinal: 'Contractura', medico: 'Patricio Lara', estado: 'Activo', fecha: new Date().toISOString() },
];

@Injectable({ providedIn: 'root' })
export class EvolucionesService {
  private base = `${environment.apiBaseUrl}/Evolucion`;
  constructor(private http: HttpClient) {}

  listByPaciente(pacienteId: number): Observable<Evolucion[]> {
    if (environment.useMock) return of(MOCK);
    return this.http
      .get<ApiResponse<EvolucionApi[]>>(`${this.base}/ListaPorPaciente/${pacienteId}`)
      .pipe(
        map(res => (res?.estado ? (res.valor || []).map(this.mapItem) : [])),
        catchError(() => of([]))
      );
  }

  create(input: EvolucionInput): Observable<Evolucion> {
    if (environment.useMock) {
      const nuevo: Evolucion = {
        id: Math.round(Math.random()*100000),
        problema: '—',
        paciente: '—',
        diagnosticoInicial: input.diagnosticoInicial,
        diagnosticoFinal: input.diagnosticoDefinitivo,
        medico: '—',
        estado: 'Activo',
        fecha: input.fechaConsulta
      };
      MOCK.unshift(nuevo);
      return of(nuevo);
    }
    return this.http.post<ApiResponse<EvolucionApi>>(`${this.base}/Crear`, {
      Descripcion: input.descripcion,
      FechaConsulta: input.fechaConsulta,
      DiagnosticoInicial: input.diagnosticoInicial,
      DiagnosticoDefinitivo: input.diagnosticoDefinitivo,
      PacienteId: input.pacienteId,
      ProblemaId: input.problemaId ?? 0,
      EstadoProblemaId: input.estadoProblemaId ?? 0,
      MedicoId: input.medicoId ?? 0,
      PlantillaId: input.plantillaId ?? 0
    }).pipe(map(res => this.mapItem(res.valor)));
  }

  update(input: EvolucionInput & { id: number }): Observable<boolean> {
    if (environment.useMock) {
      const idx = MOCK.findIndex(e => e.id === input.id);
      if (idx >= 0) {
        MOCK[idx] = { ...MOCK[idx], diagnosticoInicial: input.diagnosticoInicial, diagnosticoFinal: input.diagnosticoDefinitivo, fecha: input.fechaConsulta };
      }
      return of(true);
    }
    return this.http.put<ApiResponse<boolean>>(`${this.base}/Editar`, {
      Id: input.id,
      Descripcion: input.descripcion,
      FechaConsulta: input.fechaConsulta,
      DiagnosticoInicial: input.diagnosticoInicial,
      DiagnosticoDefinitivo: input.diagnosticoDefinitivo,
      PacienteId: input.pacienteId,
      ProblemaId: input.problemaId ?? 0,
      EstadoProblemaId: input.estadoProblemaId ?? 0,
      MedicoId: input.medicoId ?? 0,
      PlantillaId: input.plantillaId ?? 0
    }).pipe(map(r => !!r?.estado));
  }

  private mapItem = (item?: EvolucionApi): Evolucion => ({
    id: item?.id ?? 0,
    problema: item?.problemaTitulo ?? '',
    paciente: item?.pacienteNombre ?? '',
    diagnosticoInicial: item?.diagnosticoInicial ?? '',
    diagnosticoFinal: item?.diagnosticoDefinitivo ?? '',
    medico: item?.medicoNombre ?? '',
    estado: item?.estadoProblemaNombre ?? '',
    fecha: item?.fechaConsulta
  });
}

