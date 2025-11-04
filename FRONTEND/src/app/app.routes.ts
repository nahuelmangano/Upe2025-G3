import { Routes } from '@angular/router';
import { MEDICO_ROUTES } from './features/medico/medico.routes';
import { RECEPCIONISTA_ROUTES } from './features/recepcionista/recepcionista.routes';
import { ADMIN_ROUTES } from './features/admin/admin.routes';
import { AuthRedirectGuard } from './guards/auth-redirect.guard';
import { AUTH_ROUTES } from './features/auth/auth.routes';


export const routes: Routes = [
  ...AUTH_ROUTES,
  ...MEDICO_ROUTES,
  ...RECEPCIONISTA_ROUTES,
  ...ADMIN_ROUTES,

  {
    path: '',
    canActivate: [AuthRedirectGuard]
  },
  {
    path: '**',
    canActivate: [AuthRedirectGuard]
  }
];
