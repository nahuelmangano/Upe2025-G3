import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UtilidadService } from './utilidad.service';
import { InactivityService } from './inactivity.service';
import { APP_ROLES, AppRole } from '@core/constants/roles.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private utilidad = inject(UtilidadService);
  private inactivityService = inject(InactivityService);
  private router = inject(Router);

  constructor() {
    this.inactivityService.startWatching(15); // 15 minutos de inactividad
  }

  isAuthenticated(): boolean {
    const usuario = this.utilidad.obtenerSesionUsuario();
    return !!(usuario && usuario.id);
  }

  getUserRole(): AppRole | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    const usuario = this.utilidad.obtenerSesionUsuario();
    return usuario?.rolNombre as AppRole || null;
  }

  getRedirectUrlForRole(role: AppRole): string | null {
    switch (role) {
      case APP_ROLES.MEDICO:
        return '/medico';
      case APP_ROLES.RECEPCIONISTA:
        return '/recepcionista';
      case APP_ROLES.ADMIN:
        return '/admin';
      default:
        return null;
    }
  }

  hasRole(role: AppRole): boolean {
    return this.getUserRole() === role;
  }

  logout(): void {
    this.utilidad.eliminarSesionUsuario();
    this.inactivityService.stopWatching();
    this.router.navigate(['/login']);
  }
}