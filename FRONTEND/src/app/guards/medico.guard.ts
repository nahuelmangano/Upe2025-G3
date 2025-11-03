import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UtilidadService } from '../reutilizable/utilidad.service';

export const medicoGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const utilidadService = inject(UtilidadService);

  const sesion = utilidadService.obtenerSesionUsuario();
  const esMedico =
    !!sesion && typeof sesion.rolNombre === 'string' && sesion.rolNombre.toLowerCase() === 'medico';

  if (esMedico) {
    return true;
  }

  // Avoid redirect loop if already heading to login.
  if (state.url.startsWith('/login')) {
    return true;
  }

  return router.parseUrl('/login') as UrlTree;
};
