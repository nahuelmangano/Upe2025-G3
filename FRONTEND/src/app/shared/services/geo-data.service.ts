import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Ciudad {
  name: string;
}

export interface Provincia {
  state_name: string;
  cities: string[];
}

export interface Pais {
  country_name: string;
  country_name_es: string;
  states: Provincia[];
}

@Injectable({
  providedIn: 'root'
})
export class GeoDataService {
  private apiUrl = 'assets/data/paises-provincias-ciudades.json';
  private apiUrlNacionalidades = 'assets/data/nacionalidades.json';

  constructor(private http: HttpClient) { }

  obtenerUbicaciones(): Observable<Pais[]> {
    return this.http.get<Pais[]>(this.apiUrl);
  }

  obtenerNacionalidades(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrlNacionalidades);
  }

}