import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.config';
import { ResponseApi } from '../interfaces/response-api';
import { ArchivoAdjunto } from '../interfaces/archivoAdjunto';

@Injectable({
  providedIn: 'root'
})
export class ArchivoAdjuntoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private urlApi = (this.apiUrl || '/api/') + 'Archivo/';

  listaPorEstudio(estudioId: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}ListaPorEstudio/${estudioId}`);
  }

  crear(request: ArchivoAdjunto): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
  }

  subir(estudioId: number, file: File): Observable<ResponseApi> {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('estudioId', String(estudioId));
    return this.http.post<ResponseApi>(`${this.urlApi}Subir`, formData);
  }

  editar(request: ArchivoAdjunto): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
  }

  eliminar(id: number): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Eliminar/${id}`, {});
  }

  descargar(id: number) {
    return `${this.urlApi}Descargar/${id}`;
  }
}