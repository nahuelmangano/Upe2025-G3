import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Problema { id: number; titulo: string; estadoId?: number; estadoNombre?: string; descripcion?: string; }
interface ApiResponse<T> { estado: boolean; valor: T; }
interface ProblemaApi { id: number; titulo: string; descripcion?: string; estadoProblemaId?: number; estadoProblemaNombre?: string; }

const MOCK: Problema[] = [
  { id: 1, titulo: 'Apto físico', estadoId: 1, estadoNombre: 'Activo' },
  { id: 2, titulo: 'Alergia a penicilina', estadoId: 2, estadoNombre: 'Alergia' },
];

@Injectable({ providedIn: 'root' })
export class ProblemasService {
  private base = `${environment.apiBaseUrl}/Problema`;
  constructor(private http: HttpClient) {}

  list(): Observable<Problema[]> {
    if (environment.useMock) return of(MOCK);
    return this.http.get<ApiResponse<ProblemaApi[]>>(`${this.base}/Lista`).pipe(
      map(r => (r?.estado ? (r.valor||[]).map(p => ({ id:p.id, titulo:p.titulo, estadoId:p.estadoProblemaId, estadoNombre:p.estadoProblemaNombre })) : []))
    );
  }

  create(input: { titulo: string; descripcion?: string; estadoProblemaId?: number }): Observable<Problema> {
    if (environment.useMock) {
      const nuevo: Problema = { id: Math.round(Math.random()*100000), titulo: input.titulo, descripcion: input.descripcion, estadoId: input.estadoProblemaId, estadoNombre: input.estadoProblemaId===1?'Activo':'-' };
      MOCK.unshift(nuevo);
      return of(nuevo);
    }
    return this.http.post<ApiResponse<ProblemaApi>>(`${this.base}/Crear`, {
      Titulo: input.titulo,
      Descripcion: input.descripcion
    }).pipe(map(r => ({ id: r.valor?.id ?? 0, titulo: r.valor?.titulo ?? input.titulo, descripcion: r.valor?.descripcion })));
  }
}
