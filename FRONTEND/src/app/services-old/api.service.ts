import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MOCK_RESUMEN } from '../mock/mock-data';
import { API_URL } from '../app.config';

@Injectable({providedIn:'root'})
export class ApiService{
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string){}
  getResumenPaciente(pacienteId:number):Observable<any>{
    // El backend aún no expone este endpoint. Fallback al mock.
    return this.http.get(`${this.apiUrl}pacientes/${pacienteId}/resumen`).pipe(
      catchError(() => of(MOCK_RESUMEN))
    );
  }
}
