import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { Especialidad } from '@features/maestros/interfaces/especialidad';
@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private urlApi = this.apiUrl + 'Especialidad/';

    lista(): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}Lista`);
    }

    obtenerPorId(id: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}ObtenerPorId/${id}`);
    }

    crear(request: Especialidad): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
    }

    editar(request: Especialidad): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
    }

    editarPorId(id: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}Editar/${id}`);
    }
    
    eliminar(id: number): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Eliminar/${id}`, {});
    }
}
