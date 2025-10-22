import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.config'; // token de configuración
import { ResponseApi } from '../interfaces/response-api';
import { TipoEstudio } from '../interfaces/tipo-estudio';
import { API_URL } from '../app.config';
import { ResponseApi } from '../interfaces/response-api';
@Injectable({
  providedIn: 'root'
})
export class TipoEstudioService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private urlApi = this.apiUrl + 'TipoEstudio/';

    lista(): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}Lista`);
    }
    crear(request: TipoEstudio): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
    }
    editar(request: TipoEstudio): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
    }
    eliminar(id: number): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Eliminar/${id}`, {});
    }
  private urlApi = this.apiUrl + 'TipoEstudio/';

  lista(): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}Lista`);
  }
}


