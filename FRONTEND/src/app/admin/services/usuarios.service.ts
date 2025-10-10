import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  rolId: number;
  rolNombre?: string;
  estadoId: number;
  estadoNombre?: string;
}

export interface UsuarioInput {
  nombre: string;
  apellido: string;
  mail: string;
  passwordHash?: string;
  rolId: number;
  estadoId: number;
}

interface ApiResponse<T> { estado: boolean; valor: T; mensaje?: string; }
interface UsuarioApi {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  passwordHash?: string;
  rolId: number;
  rolNombre?: string;
  estadoId: number;
  estadoNombre?: string;
}

const MOCK_USUARIOS: Usuario[] = [
  { id: 1, nombre: 'Admin', apellido: 'Root', mail: 'admin@upe.test', rolId: 1, rolNombre: 'Administrador', estadoId: 1, estadoNombre: 'Activo' },
  { id: 2, nombre: 'Laura', apellido: 'Gomez', mail: 'lgomez@upe.test', rolId: 2, rolNombre: 'Medico', estadoId: 1, estadoNombre: 'Activo' },
];

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private baseUrl = `${environment.apiBaseUrl}/Usuario`;
  constructor(private http: HttpClient) {}

  list(): Observable<Usuario[]> {
    if (environment.useMock) return of(MOCK_USUARIOS);
    return this.http.get<ApiResponse<UsuarioApi[]>>(`${this.baseUrl}/Lista`).pipe(
      map(res => (res?.estado ? (res.valor || []).map(this.mapItem) : []))
    );
  }

  create(input: UsuarioInput): Observable<Usuario> {
    if (environment.useMock) {
      const nuevo: Usuario = { id: Math.round(Math.random()*100000), ...input } as Usuario;
      (nuevo as any).rolNombre = nuevo.rolId === 1 ? 'Administrador' : 'Usuario';
      (nuevo as any).estadoNombre = nuevo.estadoId === 1 ? 'Activo' : 'Inactivo';
      MOCK_USUARIOS.unshift(nuevo);
      return of(nuevo);
    }
    return this.http.post<ApiResponse<UsuarioApi>>(`${this.baseUrl}/Crear`, {
      Nombre: input.nombre,
      Apellido: input.apellido,
      Mail: input.mail,
      PasswordHash: input.passwordHash,
      RolId: input.rolId,
      EstadoId: input.estadoId
    }).pipe(map(res => this.mapItem(res.valor)));
  }

  update(id: number, input: UsuarioInput): Observable<boolean> {
    if (environment.useMock) {
      const idx = MOCK_USUARIOS.findIndex(u => u.id === id);
      if (idx >= 0) {
        MOCK_USUARIOS[idx] = { id, ...input } as Usuario;
      }
      return of(true);
    }
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/Editar`, {
      Id: id,
      Nombre: input.nombre,
      Apellido: input.apellido,
      Mail: input.mail,
      PasswordHash: input.passwordHash,
      RolId: input.rolId,
      EstadoId: input.estadoId
    }).pipe(map(res => !!res?.estado));
  }

  eliminar(id: number): Observable<boolean> {
    if (environment.useMock) {
      const idx = MOCK_USUARIOS.findIndex(u => u.id === id);
      if (idx >= 0) MOCK_USUARIOS.splice(idx,1);
      return of(true);
    }
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/Eliminar/${id}`, {}).pipe(map(r => !!r?.estado));
  }

  private mapItem = (item?: UsuarioApi): Usuario => ({
    id: item?.id ?? 0,
    nombre: item?.nombre ?? '',
    apellido: item?.apellido ?? '',
    mail: item?.mail ?? '',
    rolId: item?.rolId ?? 0,
    rolNombre: item?.rolNombre,
    estadoId: item?.estadoId ?? 0,
    estadoNombre: item?.estadoNombre
  });
}

