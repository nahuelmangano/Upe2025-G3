import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../app.config';

interface ApiResponse<T> { estado: boolean; valor: T; }
export interface Opcion { id: number; nombre: string; }

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string) {}
  private get base(){ return `${this.apiUrl}Catalogo`; }

  estadoUsuario(): Observable<Opcion[]> {
    return this.http.get<ApiResponse<Opcion[]>>(`${this.base}/EstadoUsuario`).pipe(map(r => r?.estado ? (r.valor||[]) : []));
  }

  roles(): Observable<Opcion[]> {
    return this.http.get<ApiResponse<Opcion[]>>(`${this.base}/Rol`).pipe(map(r => r?.estado ? (r.valor||[]) : []));
  }
}

