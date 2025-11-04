import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@core/tokens/api-url.token';
import { Observable } from 'rxjs';
import { ResponseApi } from '@core/interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class SexoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + 'Catalogo/';

  lista(): Observable<ResponseApi>{
    return this.http.get<ResponseApi>(`${this.urlApi}Sexo`);
  }
}
