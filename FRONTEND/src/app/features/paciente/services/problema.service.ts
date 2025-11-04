import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { Problema } from '@features/paciente/interfaces/problema';

@Injectable({
  providedIn: 'root'
})
export class ProblemaService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + 'Problema/';

  lista(): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}Lista`);
  }

  listaPorPaciente(pacienteId: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}ListaPorPaciente/${pacienteId}`);
  }

  crear(request: Problema): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
  }

  editar(request: Problema): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
  }

}