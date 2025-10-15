import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.config';
import { ResponseApi } from '../interfaces/response-api';
import { Estudio } from '../interfaces/estudio';

@Injectable({
  providedIn: 'root'
})
export class EstudioService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + 'Estudio/';

  listaPorEvolucion(evolucionId: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}ListaPorEvolucion/${evolucionId}`);
  }

  crear(request: Estudio): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
  }

  editar(request: Estudio): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
  }
}
