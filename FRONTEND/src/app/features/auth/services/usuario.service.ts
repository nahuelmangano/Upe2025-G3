import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { Login } from '@features/auth/interfaces/login';
import { Usuario } from '@features/admin/interfaces/usuario';
import { UsuarioCambiarPasswordPorMail } from '@features/admin/interfaces/UsuarioCambiarPasswordPorMail';
import { UsuarioCambiarPassword } from '@features/admin/interfaces/UsuarioCambiarPassword';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + 'Usuario/';

  iniciarSesion(request: Login): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}IniciarSesion`, request);
  }

  enviarMailCambiarPassword(request: UsuarioCambiarPasswordPorMail): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}EnviarMailCambiarPassword`, request);
  }

  cambiarPassword(request: UsuarioCambiarPassword): Observable<ResponseApi>{
    return this.http.post<ResponseApi>(`${this.urlApi}CambiarPassword`, request);
  } 

  lista(): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(`${this.urlApi}Lista`);
  }

  crear(request: Usuario): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.urlApi}Crear`, request);
  }

  editar(request: Usuario): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request);
  }

  eliminar(id: number): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(`${this.urlApi}Eliminar/${id}`, {});
  }
}