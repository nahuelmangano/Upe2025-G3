import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.config'; // token de configuración
import { ResponseApi } from '../interfaces/response-api';
import { Evolucion } from '../interfaces/evolucion';
import { API_URL } from '../app.config';
import { ResponseApi } from '../interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class EvolucionService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + 'Evolucion/';

  listaPorPaciente(pacienteId: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}ListaPorPaciente/${pacienteId}`);
  }

  crear(request: Evolucion): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
  }

  editar(request: Evolucion): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
  }

}
