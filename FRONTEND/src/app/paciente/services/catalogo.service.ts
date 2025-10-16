import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '../../app.config';

export interface Opcion { id: number; nombre: string; }
interface ApiResponse<T> { estado: boolean; valor: T; }

@Injectable({ providedIn: 'root' })
export class PacienteCatalogoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private base = `${this.apiUrl}Catalogo`;

  estadosProblema(): Observable<Opcion[]> {
    // Si necesitas mock, implementa una variable local o de config
    return this.http.get<ApiResponse<Opcion[]>>(`${this.base}/EstadoProblema`).pipe(
      map(r => (r?.estado ? (r.valor || []) : []))
    );
  }
}