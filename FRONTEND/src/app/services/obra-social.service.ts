import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.config'; // token de configuración
import { ResponseApi } from '../interfaces/response-api';
import { ObraSocial } from '../interfaces/obra-social';


@Injectable({
  providedIn: 'root'
})
export class ObraSocialService {
    private http = inject(HttpClient);
    private apiUrl = inject(API_URL);

    private urlApi = this.apiUrl + 'ObraSocial/';

    lista(): Observable<ResponseApi> {
        return this.http.get<ResponseApi>(this.urlApi + 'Lista');
    }

     crear(request: ObraSocial): Observable<ResponseApi> {
        return this.http.post<ResponseApi>(this.urlApi + 'Crear', request);
    } 

    editar(request: ObraSocial): Observable<ResponseApi> {
        return this.http.put<ResponseApi>(this.urlApi + 'Editar', request);
    } 

      eliminar(id: number): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Eliminar/${id}`, {});
  }


  
}