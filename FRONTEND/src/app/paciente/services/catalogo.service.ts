import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Opcion { id: number; nombre: string; }
interface ApiResponse<T> { estado: boolean; valor: T; }

@Injectable({ providedIn: 'root' })
export class PacienteCatalogoService {
  private base = `${environment.apiBaseUrl}/Catalogo`;
  constructor(private http: HttpClient) {}

  estadosProblema(): Observable<Opcion[]> {
    if (environment.useMock) return of([{id:1,nombre:'Activo'},{id:2,nombre:'Alergia'},{id:3,nombre:'Resuelto'}]);
    return this.http.get<ApiResponse<Opcion[]>>(`${this.base}/EstadoProblema`).pipe(
      map(r => (r?.estado ? (r.valor || []) : []))
    );
  }
}

