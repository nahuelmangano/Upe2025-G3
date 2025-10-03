import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { MOCK_RESUMEN } from '../mock/mock-data';

@Injectable({providedIn:'root'})
export class ApiService{
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient){}
  getResumenPaciente(pacienteId:number):Observable<any>{
    if(environment.useMock) return of(MOCK_RESUMEN);
    return this.http.get(`${this.base}/pacientes/${pacienteId}/resumen`);
    return of(MOCK_RESUMEN);
  }
}
