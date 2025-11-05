import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class EvolucionService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private urlApi = (this.apiUrl || '/api/') + 'Evolucion/';

  listaPorPaciente(pacienteId: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}ListaPorPaciente/${pacienteId}`);
  }

  editar(request: any): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
  }
}
