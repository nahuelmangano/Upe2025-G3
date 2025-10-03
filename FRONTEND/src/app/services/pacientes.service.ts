import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Paciente {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  estado?: 'Activo' | 'Inactivo';
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
const MOCK_PACIENTES: Paciente[] = [
  { id: 1, nombre: 'Juan Gomez', email: 'gomi@gmail.com', telefono: '112222222', ciudad: 'Temperley', estado: 'Activo' },
  { id: 2, nombre: 'Ana Perez', email: 'ana.perez@example.com', telefono: '116543210', ciudad: 'Lanus', estado: 'Activo' },
  { id: 3, nombre: 'Carlos Diaz', email: 'carlos.diaz@example.com', telefono: '114567890', ciudad: 'Adrogue', estado: 'Inactivo' },
  { id: 4, nombre: 'Lucia Romero', email: 'lucia.romero@example.com', telefono: '113334455', ciudad: 'Lomas', estado: 'Activo' },
  { id: 5, nombre: 'Martin Suarez', email: 'martin.suarez@example.com', telefono: '117778889', ciudad: 'Banfield', estado: 'Activo' },
  { id: 6, nombre: 'Sofia Lopez', email: 'sofia.lopez@example.com', telefono: '115551112', ciudad: 'Temperley', estado: 'Activo' }
];

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly baseUrl = `${environment.apiBaseUrl}/Paciente`;

  constructor(private http: HttpClient) {}

  list(): Observable<Paciente[]> {
    if (environment.useMock) {
      return of(MOCK_PACIENTES);
    }
    return this.http
      .get<ApiResponse<PacienteApi[]>>(`${this.baseUrl}/Lista`)
      .pipe(map(res => this.mapResponse(res)));
  }

  get(id: number): Observable<Paciente> {
    if (environment.useMock) {
      const found = MOCK_PACIENTES.find(p => p.id === id);
      return of(found ?? MOCK_PACIENTES[0]);
    }
    return this.list().pipe(map(items => items.find(p => p.id === id) ?? { id, nombre: '' }));
  }

  create(input: PacienteCreate): Observable<Paciente> {
    if (environment.useMock) {
      const nuevo: Paciente = {
        id: Math.round(Math.random() * 100000),
        nombre: `${input.nombre ?? ''} ${input.apellido ?? ''}`.trim() || 'Sin nombre',
        email: input.email,
        telefono: input.telefono1,
        ciudad: input.domicilioCiudad,
        estado: 'Activo'
      };
      MOCK_PACIENTES.unshift(nuevo);
      return of(nuevo);
    }

    return this.http
      .post<ApiResponse<PacienteApi>>(`${this.baseUrl}/Crear`, input)
      .pipe(map(res => this.mapItem(res.valor)));
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
      estado: (item.estadoNombre as 'Activo' | 'Inactivo') ?? 'Activo'
    };
  }
}


