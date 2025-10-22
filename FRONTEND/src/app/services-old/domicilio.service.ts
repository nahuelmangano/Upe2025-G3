import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URL } from '../app.config';

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
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string) {}
  private get baseUrl(){ return `${this.apiUrl}Domicilio`; }

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

