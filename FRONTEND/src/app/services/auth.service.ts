import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  estado?: boolean;
  valor?: T;
  mensaje?: string;
  Estado?: boolean;
  Valor?: T;
  Mensaje?: string;
}

export interface SessionUser {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  rolNombre?: string;
}

const STORAGE_KEY = 'upe-session';
const MOCK_SESSION: SessionUser = {
  id: 1,
  nombre: 'Usuario',
  apellido: 'Demo',
  mail: 'demo@upe.com',
  rolNombre: 'Administrador'
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/Usuario`;
  private readonly sessionSubject = new BehaviorSubject<SessionUser | null>(this.readStoredSession());

  readonly session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(mail: string, password: string): Observable<SessionUser> {
    if (!mail || !password) {
      return throwError(() => new Error('Debe completar usuario y contraseña'));
    }

    if (environment.useMock) {
      const session = { ...MOCK_SESSION, mail };
      this.persistSession(session);
      return of(session);
    }

    return this.http
      .post<ApiResponse<SessionUser | Record<string, any>>>(`${this.baseUrl}/IniciarSesion`, {
        Mail: mail,
        PasswordHash: password
      })
      .pipe(
        map(response => {
          const ok = response?.estado ?? response?.Estado ?? false;
          const data = response?.valor ?? response?.Valor;
          if (!ok || !data) {
            throw new Error(response?.mensaje ?? response?.Mensaje ?? 'Credenciales inválidas');
          }
          const raw = data as any;
          const session: SessionUser = {
            id: raw?.id ?? raw?.Id ?? 0,
            nombre: raw?.nombre ?? raw?.Nombre ?? '',
            apellido: raw?.apellido ?? raw?.Apellido ?? '',
            mail: raw?.mail ?? raw?.Mail ?? mail,
            rolNombre: raw?.rolNombre ?? raw?.RolNombre ?? ''
          };
          if (!session.id) {
            throw new Error('Respuesta inválida del servidor');
          }
          return session;
        }),
        tap(session => this.persistSession(session)),
        catchError(err => throwError(() => new Error(err?.error?.mensaje ?? err?.message ?? 'No se pudo iniciar sesión')))
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sessionSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.sessionSubject.value;
  }

  isAdmin(): boolean {
    const role = this.sessionSubject.value?.rolNombre ?? '';
    return role.toLowerCase() === 'administrador';
  }

  isRecepcionista(): boolean {
    const role = this.sessionSubject.value?.rolNombre ?? '';
    return role.toLowerCase() === 'recepcionista';
  }

  hasRole(role: string): boolean {
    const current = this.sessionSubject.value?.rolNombre ?? '';
    return current.toLowerCase() === role.toLowerCase();
  }

  get snapshot(): SessionUser | null {
    return this.sessionSubject.value;
  }

  private readStoredSession(): SessionUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as SessionUser;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private persistSession(session: SessionUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.sessionSubject.next(session);
  }
}
