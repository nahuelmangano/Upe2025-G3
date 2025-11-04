import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_URL } from '@core/tokens/api-url.token';

export interface Evolucion {
  id: number;
  problema?: string;
  problemaId?: number;
  paciente?: string;
  diagnosticoInicial: string;
  diagnosticoFinal?: string;
  medico?: string;
  estado?: string;
  estadoProblemaId?: number;
  fecha?: string; // ISO
  plantillaId?: number | null;
  plantillaNombre?: string | null;
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
  plantillaId?: number | null;
}

interface ApiResponse<T> { estado: boolean; valor: T; mensaje?: string; }
interface EvolucionApi {
  // El backend expone PascalCase; dejamos camel opcional por si cambia
  id: number;
  descripcion?: string; Descripcion?: string;
  fechaConsulta: string; FechaConsulta?: string;
  diagnosticoInicial: string; DiagnosticoInicial?: string;
  diagnosticoDefinitivo?: string; DiagnosticoDefinitivo?: string;
  pacienteId: number; PacienteId?: number;
  pacienteNombre?: string; PacienteNombre?: string;
  plantillaId?: number; PlantillaId?: number;
  plantillaNombre?: string; PlantillaNombre?: string;
  problemaId?: number; ProblemaId?: number;
  problemaTitulo?: string; ProblemaTitulo?: string;
  estadoProblemaId?: number; EstadoProblemaId?: number;
  estadoProblemaNombre?: string; EstadoProblemaNombre?: string;
  medicoId?: number; MedicoId?: number;
  medicoNombre?: string; MedicoNombre?: string;
}

const MOCK: Evolucion[] = [
  { id: 1, problema: 'Chequeo', paciente: 'Ian Guya', diagnosticoInicial: 'asnkasnc', diagnosticoFinal: 'asnkasnc', medico: 'Patricio Lara', estado: 'Activo', fecha: new Date().toISOString() },
  { id: 2, problema: 'Dolor lumbar', paciente: 'Ian Guya', diagnosticoInicial: 'Contractura', diagnosticoFinal: 'Contractura', medico: 'Patricio Lara', estado: 'Activo', fecha: new Date().toISOString() },
];

@Injectable({ providedIn: 'root' })
export class EvolucionesService {
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string) {}
  private get base() { return `${this.apiUrl}Evolucion`; }

  listByPaciente(pacienteId: number): Observable<Evolucion[]> {
    return this.http
      .get<ApiResponse<EvolucionApi[]>>(`${this.base}/ListaPorPaciente/${pacienteId}`)
      .pipe(
        map(res => (res?.estado ? (res.valor || []).map(this.mapItem) : [])),
        catchError(() => of([]))
      );
  }

  create(input: EvolucionInput): Observable<Evolucion> {
    return this.http.post<ApiResponse<EvolucionApi>>(`${this.base}/Crear`, {
      Descripcion: input.descripcion,
      FechaConsulta: input.fechaConsulta,
      DiagnosticoInicial: input.diagnosticoInicial,
      DiagnosticoDefinitivo: input.diagnosticoDefinitivo,
      PacienteId: input.pacienteId,
      ProblemaId: input.problemaId ?? 0,
      EstadoProblemaId: input.estadoProblemaId ?? 0,
      MedicoId: input.medicoId ?? 0,
      PlantillaId: input.plantillaId ?? null
    }).pipe(map(res => this.mapItem(res.valor)));
  }

  update(input: EvolucionInput & { id: number }): Observable<boolean> {
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
      PlantillaId: input.plantillaId ?? null
    }).pipe(map(r => !!r?.estado));
  }

  private mapItem = (item?: EvolucionApi): Evolucion => {
    const it: any = item || {};
    return {
      id: it.id ?? 0,
      problema: it.problemaTitulo ?? it.ProblemaTitulo ?? '',
      problemaId: it.problemaId ?? it.ProblemaId,
      paciente: it.pacienteNombre ?? it.PacienteNombre ?? '',
      diagnosticoInicial: it.diagnosticoInicial ?? it.DiagnosticoInicial ?? '',
      diagnosticoFinal: it.diagnosticoDefinitivo ?? it.DiagnosticoDefinitivo ?? '',
      medico: it.medicoNombre ?? it.MedicoNombre ?? '',
      estado: it.estadoProblemaNombre ?? it.EstadoProblemaNombre ?? '',
      estadoProblemaId: it.estadoProblemaId ?? it.EstadoProblemaId,
      fecha: it.fechaConsulta ?? it.FechaConsulta,
      plantillaId: it.plantillaId ?? it.PlantillaId ?? null,
      plantillaNombre: it.plantillaNombre ?? it.PlantillaNombre ?? null
    };
  };
}
