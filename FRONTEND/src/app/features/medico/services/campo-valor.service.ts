import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { CampoValor } from '@features/medico/interfaces/campoValor';

@Injectable({
  providedIn: 'root'
})
export class CampoValorService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + 'CampoValor/';

  listaPorCampoEvolucion(campoId: number, evolucionId: number): Observable<ResponseApi> {
    const url = `${this.urlApi}ListaPorCampoEvolucion/${campoId}/${evolucionId}`;
    return this.http.get<ResponseApi>(url);
  }

  listaPorEvolucion(evolucionId: number): Observable<ResponseApi> {
    const url = `${this.urlApi}ListaPorEvolucion/${evolucionId}`;
    return this.http.get<ResponseApi>(url);
  }

  crear(request: CampoValor): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
  }

  editar(request: CampoValor): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
  }

}
