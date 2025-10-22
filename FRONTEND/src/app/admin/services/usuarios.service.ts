import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../app.config';

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
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string) {}
  private get baseUrl(){ return `${this.apiUrl}Usuario`; }

  list(): Observable<Usuario[]> {
    return this.http.get<ApiResponse<UsuarioApi[]>>(`${this.baseUrl}/Lista`).pipe(
      map(res => (res?.estado ? (res.valor || []).map(this.mapItem) : []))
    );
  }

  create(input: UsuarioInput): Observable<Usuario> {
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

