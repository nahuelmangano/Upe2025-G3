import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { RegistroComponent } from './components/registro/registro.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'crear-cuenta', component: RegistroComponent },
  { path: 'cambiar-password', component: ForgotPasswordComponent },
];