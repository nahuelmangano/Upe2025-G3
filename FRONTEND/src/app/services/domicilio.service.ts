import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DomicilioInput {
  calle?: string;
  altura?: string;
  piso?: string;
  departamento?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  codigoPostal?: string;
}

interface ApiResponse<T> {
  estado: boolean;
  valor: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class DomicilioService {
  private readonly baseUrl = `${environment.apiBaseUrl}/Domicilio`;

  constructor(private http: HttpClient) {}

  crear(payload: DomicilioInput): Observable<number> {
    return this.http
      .post<ApiResponse<{ id: number }>>(`${this.baseUrl}/Crear`, payload)
      .pipe(
        map(res => {
          if (!res?.estado || !res.valor?.id) {
            throw new Error(res?.mensaje || 'No se pudo crear el domicilio');
          }
          return res.valor.id;
        })
      );
  }
}

