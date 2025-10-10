import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { estado: boolean; valor: T; }
export interface Opcion { id: number; nombre: string; }

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private base = `${environment.apiBaseUrl}/Catalogo`;
  constructor(private http: HttpClient) {}

  estadoUsuario(): Observable<Opcion[]> {
    if (environment.useMock) return of([{id:1,nombre:'Activo'},{id:2,nombre:'Inactivo'}]);
    return this.http.get<ApiResponse<Opcion[]>>(`${this.base}/EstadoUsuario`).pipe(map(r => r?.estado ? (r.valor||[]) : []));
  }

  roles(): Observable<Opcion[]> {
    if (environment.useMock) return of([{id:1,nombre:'Administrador'},{id:2,nombre:'Usuario'}]);
    return this.http.get<ApiResponse<Opcion[]>>(`${this.base}/Rol`).pipe(map(r => r?.estado ? (r.valor||[]) : []));
  }
}

