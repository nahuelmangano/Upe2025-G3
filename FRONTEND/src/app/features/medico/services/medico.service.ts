import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { Medico } from '@features/medico/interfaces/medico';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
    private http = inject(HttpClient);
    private apiUrl = inject(API_URL);

    private urlApi = this.apiUrl + 'Medico/';

    lista(): Observable<ResponseApi> {
        return this.http.get<ResponseApi>(this.urlApi + 'Lista');
    }

    editar(request: Medico): Observable<ResponseApi> {
        return this.http.put<ResponseApi>(this.urlApi + 'Editar', request);
    } 

     eliminar(id: number): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Eliminar/${id}`, {});
  }


  
}





