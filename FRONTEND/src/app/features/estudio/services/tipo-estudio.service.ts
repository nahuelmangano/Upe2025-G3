import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
@Injectable({
  providedIn: 'root'
})
export class TipoEstudioService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private urlApi = (this.apiUrl || '/api/') + 'TipoEstudio/';

  lista(): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}Lista`);
  }
}


