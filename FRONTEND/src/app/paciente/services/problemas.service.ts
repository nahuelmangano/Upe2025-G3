import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../app.config';

export interface Problema { id: number; titulo: string; estadoId?: number; estadoNombre?: string; descripcion?: string; }
interface ApiResponse<T> { estado: boolean; valor: T; }
interface ProblemaApi { id: number; titulo: string; descripcion?: string; estadoProblemaId?: number; estadoProblemaNombre?: string; }

const MOCK: Problema[] = [
  { id: 1, titulo: 'Apto físico', estadoId: 1, estadoNombre: 'Activo' },
  { id: 2, titulo: 'Alergia a penicilina', estadoId: 2, estadoNombre: 'Alergia' },
];

@Injectable({ providedIn: 'root' })
export class ProblemasService {
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string) {}
  private get base(){ return `${this.apiUrl}Problema`; }

  list(): Observable<Problema[]> {
    return this.http.get<ApiResponse<ProblemaApi[]>>(`${this.base}/Lista`).pipe(
      map(r => (r?.estado ? (r.valor||[]).map(p => ({ id:p.id, titulo:p.titulo, estadoId:p.estadoProblemaId, estadoNombre:p.estadoProblemaNombre })) : []))
    );
  }

  create(input: { titulo: string; descripcion?: string; estadoProblemaId?: number }): Observable<Problema> {
    return this.http.post<ApiResponse<ProblemaApi>>(`${this.base}/Crear`, {
      Titulo: input.titulo,
      Descripcion: input.descripcion
    }).pipe(map(r => ({ id: r.valor?.id ?? 0, titulo: r.valor?.titulo ?? input.titulo, descripcion: r.valor?.descripcion })));
  }
}
