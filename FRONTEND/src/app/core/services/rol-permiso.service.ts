import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { RolPermiso } from '@core/interfaces/rol-permiso';
@Injectable({
  providedIn: 'root'
})
export class RolPermisoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + 'RolPermiso/';

    listaPorRolPermiso(rolId: number, permisoId: number): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}ListaPorRolPermiso/${rolId}/${permisoId}`);
    }

    crear(request: RolPermiso): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
    }
    editar(request: RolPermiso): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
    }
}
