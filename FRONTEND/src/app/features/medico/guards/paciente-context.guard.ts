import { Injectable } from '@angular/core';
import { CanMatch, Router, Route, UrlSegment, UrlTree } from '@angular/router';
import { PacienteContextService } from '@core/services/paciente-context.service';

@Injectable({
  providedIn: 'root'
})
export class PacienteContextGuard implements CanMatch {
  constructor(
    private pacienteContextService: PacienteContextService,
    private router: Router
  ) {}

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const pacienteId = this.pacienteContextService.getPacienteIdActual();

    if (pacienteId) {
      const urlTree = this.router.createUrlTree(['/medico', 'paciente', pacienteId, 'resumen']);
      return urlTree;
    }

    return true;
  }
}