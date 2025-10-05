import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MOCK_RESUMEN } from '../mock/mock-data';

@Injectable({providedIn:'root'})
export class ApiService{
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient){}
  getResumenPaciente(pacienteId:number):Observable<any>{
    if(environment.useMock) return of(MOCK_RESUMEN);
    // El backend aún no expone este endpoint. Fallback al mock.
    return this.http.get(`${this.base}/pacientes/${pacienteId}/resumen`).pipe(
      catchError(() => of(MOCK_RESUMEN))
    );
  }
}
