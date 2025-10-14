import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_URL } from "../app.config"; // token de configuración
import { ResponseApi } from "../interfaces/response-api";
import { PacienteObraSocial } from "../interfaces/paciente-obra-social";


@Injectable({
  providedIn: "root",
})
export class PacienteObraSocialService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private urlApi = this.apiUrl + "PacienteObraSocial/";

  listaPorPacienteObraSocial(
    pacienteId: number,
    obraSocialId: number
  ): Observable<ResponseApi> {
    return this.http.get<ResponseApi>(
      `${this.urlApi}ListaPorPacienteObraSocial/${pacienteId}/${obraSocialId}`
    );
  }

  crear(request: PacienteObraSocial): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(this.urlApi + "Crear", request);
  }

  editar(request: PacienteObraSocial): Observable<ResponseApi> {
    return this.http.put<ResponseApi>(this.urlApi + "Editar", request);
  }

  eliminar(id: number): Observable<ResponseApi> {
    return this.http.delete<ResponseApi>(this.urlApi + "Eliminar/" + id);
  }
}
