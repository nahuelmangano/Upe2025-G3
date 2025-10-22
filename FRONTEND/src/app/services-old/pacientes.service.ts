import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../app.config';

export interface Paciente {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  estado?: 'Activo' | 'Inactivo';
  dni?: string;
  fechaNac?: string; // ISO 8601
}

interface PacienteApi {
  id: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  fechaNac?: string;
  grupoSanguineo?: string;
  nacionalidad?: string;
  ocupacion?: string;
  telefono1?: string;
  telefono2?: string;
  domicilioId?: number;
  domicilioCiudad?: string;
  sexoId?: number;
  sexoNombre?: string;
  estadoNombre?: string;
}

interface ApiResponse<T> {
  estado: boolean;
  valor: T;
  mensaje?: string;
}

export interface PacienteCreate {
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  fechaNac?: string; // ISO 8601
  telefono1?: string;
  telefono2?: string;
  nacionalidad?: string;
  ocupacion?: string;
  grupoSanguineo?: string;
  sexoId?: number | null;
  domicilioId?: number;
  domicilioCalle?: string;
  domicilioAltura?: string;
  domicilioPiso?: string;
  domicilioDepartamento?: string;
  domicilioCiudad?: string;
  domicilioProvincia?: string;
  domicilioPais?: string;
  domicilioCodigoPostal?: string;
}

export interface PacienteUpdate extends PacienteCreate {
  id: number;
}
const MOCK_PACIENTES: Paciente[] = [
  { id: 1, nombre: 'Juan Gomez', email: 'gomi@gmail.com', telefono: '112222222', ciudad: 'Temperley', estado: 'Activo', dni: '12.345.678', fechaNac: '1990-06-15T00:00:00Z' },
  { id: 2, nombre: 'Ana Perez', email: 'ana.perez@example.com', telefono: '116543210', ciudad: 'Lanus', estado: 'Activo', dni: '20.111.333', fechaNac: '1985-02-10T00:00:00Z' },
  { id: 3, nombre: 'Carlos Diaz', email: 'carlos.diaz@example.com', telefono: '114567890', ciudad: 'Adrogue', estado: 'Inactivo' },
  { id: 4, nombre: 'Lucia Romero', email: 'lucia.romero@example.com', telefono: '113334455', ciudad: 'Lomas', estado: 'Activo' },
  { id: 5, nombre: 'Martin Suarez', email: 'martin.suarez@example.com', telefono: '117778889', ciudad: 'Banfield', estado: 'Activo' },
  { id: 6, nombre: 'Sofia Lopez', email: 'sofia.lopez@example.com', telefono: '115551112', ciudad: 'Temperley', estado: 'Activo' }
];

@Injectable({ providedIn: 'root' })
export class PacientesService {
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string) {}
  private get baseUrl(){ return `${this.apiUrl}Paciente`; }

  list(): Observable<Paciente[]> {
    return this.http
      .get<ApiResponse<PacienteApi[]>>(`${this.baseUrl}/Lista`)
      .pipe(map(res => this.mapResponse(res)));
  }

  get(id: number): Observable<Paciente> {
    return this.list().pipe(map(items => items.find(p => p.id === id) ?? { id, nombre: '' }));
  }

  create(input: PacienteCreate): Observable<Paciente> {
    return this.http
      .post<ApiResponse<PacienteApi>>(`${this.baseUrl}/Crear`, input)
      .pipe(map(res => this.mapItem(res.valor)));
  }

  update(input: PacienteUpdate): Observable<Paciente> {
    return this.http
      .put<ApiResponse<boolean>>(`${this.baseUrl}/Editar`, { ...input })
      .pipe(map(() => ({
        id: input.id,
        nombre: `${input.nombre ?? ''} ${input.apellido ?? ''}`.trim(),
        email: input.email,
        telefono: input.telefono1 ?? input.telefono2,
        ciudad: input.domicilioCiudad,
        estado: 'Activo'
      })));
  }

  eliminar(id: number): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${this.baseUrl}/Eliminar/${id}`, {})
      .pipe(map(res => !!res?.estado));
  }

  private mapResponse(res: ApiResponse<PacienteApi[]>): Paciente[] {
    if (!res?.estado) {
      return [];
    }
    return (res.valor ?? []).map(item => this.mapItem(item));
  }

  private mapItem(item: PacienteApi | undefined): Paciente {
    if (!item) {
      return { id: 0, nombre: '', estado: 'Activo' };
    }
    return {
      id: item.id,
      nombre: `${item.nombre ?? ''} ${item.apellido ?? ''}`.trim(),
      email: item.email ?? '',
      telefono: item.telefono1 ?? item.telefono2 ?? '',
      ciudad: item.domicilioCiudad ?? '',
      estado: (item.estadoNombre as 'Activo' | 'Inactivo') ?? 'Activo',
      dni: item.dni,
      fechaNac: item.fechaNac
    };
  }
}
