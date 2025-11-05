import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';
import { ResponseApi } from '@core/interfaces/response-api';
import { Paciente } from '@features/paciente/interfaces/paciente';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private urlApi = this.apiUrl + 'Paciente/';

    lista(): Observable<ResponseApi> {
        return this.http.get<ResponseApi>(this.urlApi + 'Lista');
    }
    obtener(id: number): Observable<Paciente | null> {
      return this.lista().pipe(
        map((res: ResponseApi) => {
          const items: Paciente[] = (res?.valor || []) as Paciente[];
          return items.find(p => p.id === id) || null;
        })
      );
    }
    crear(request: Paciente): Observable<ResponseApi> {
        return this.http.post<ResponseApi>(this.urlApi + 'Crear', request);
    }
    editar(request: Paciente): Observable<ResponseApi> {
        return this.http.put<ResponseApi>(this.urlApi + 'Editar', request);
    }
    eliminar(id: number): Observable<ResponseApi> {
        return this.http.put<ResponseApi>(this.urlApi + 'Eliminar/' + id, {});
    } 
}
