import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { FirmaDigital } from '@features/medico/interfaces/firma-digital';

@Injectable({
  providedIn: 'root'
})
export class FirmaService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + 'Firma/';

  listaPorMedico(medicoId: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}ListaPorMedico/${medicoId}`);
  }

  crear(request: FirmaDigital): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
  }

  editar(request: FirmaDigital): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
  }

  eliminar(id: number): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Eliminar/${id}`, {});
  }
}