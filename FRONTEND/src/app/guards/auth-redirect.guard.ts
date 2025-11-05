import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UtilidadService } from '@core/services/utilidad.service';

@Injectable({ providedIn: 'root' })
export class AuthRedirectGuard implements CanActivate {
  constructor(
    private utilidad: UtilidadService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const usuario = this.utilidad.obtenerSesionUsuario();

    if (usuario) {
      if (usuario.rolNombre === 'Medico') {
        return this.router.createUrlTree(['/medico']);
      } else if (usuario.rolNombre === 'Recepcionista') {
        return this.router.createUrlTree(['/recepcionista']);
      } else if (usuario.rolNombre === 'Administrador') {
        return this.router.createUrlTree(['/admin']);
      }
      return this.router.createUrlTree(['/login']);
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}