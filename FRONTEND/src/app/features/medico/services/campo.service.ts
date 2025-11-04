import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { Campo } from '@features/medico/interfaces/campo';

@Injectable({
  providedIn: 'root'
})
export class CampoService {
    private http = inject(HttpClient);
    private apiUrl = inject(API_URL);
  
    private urlApi = this.apiUrl + 'Campo/';
    lista(plantillaId: number): Observable<ResponseApi> {
      return this.http.get<ResponseApi>(`${this.urlApi}ListaPorPlantilla/${plantillaId}`);
    }
  
    crear(request: Campo): Observable<ResponseApi> {
      return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
    }
    editar(request: Campo): Observable<ResponseApi> {
      return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
    }
    eliminar(id: number): Observable<ResponseApi> {
      return this.http.put<ResponseApi>(`${this.urlApi}Eliminar/${id}`, {});
    }
}
