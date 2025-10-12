import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-shell">
      <div class="login-card">
        <h1 class="h2">Ingresar</h1>
        <form (ngSubmit)="submit()" #loginForm="ngForm">
          <label>
            <span>Correo</span>
            <input type="email" name="mail" [(ngModel)]="mail" required />
          </label>
          <label>
            <span>Contraseña</span>
            <input type="password" name="password" [(ngModel)]="password" required />
          </label>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button class="btn" type="submit" [disabled]="loading || loginForm.invalid">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-shell{
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:100vh;
      padding:32px;
      background:linear-gradient(135deg,#4f46e5,#7c3aed);
    }
    .login-card{
      background:#fff;
      padding:32px;
      border-radius:12px;
      width:100%;
      max-width:360px;
      box-shadow:0 20px 45px rgba(20,20,60,0.25);
      display:grid;
      gap:16px;
    }
    form{
      display:grid;
      gap:14px;
    }
    label{
      display:grid;
      gap:6px;
    }
    input{
      border:1px solid #dfe1f0;
      border-radius:8px;
      padding:10px 12px;
    }
    .error{
      color:#e11d48;
      font-size:0.9rem;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  mail = '';
  password = '';
  loading = false;
  error = '';
  private sub?: Subscription;
  private returnUrl: string | null = null;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sub = this.route.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnUrl');
    });

    if (this.auth.isAuthenticated()) {
      this.navigateAfterLogin();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  submit(): void {
    if (this.loading) { return; }
    this.error = '';
    this.loading = true;

    this.auth.login(this.mail, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.navigateAfterLogin();
      },
      error: err => {
        this.loading = false;
        this.error = err?.message ?? 'No pudimos iniciar sesión';
      }
    });
  }

  private navigateAfterLogin(): void {
    const session = this.auth.snapshot;
    const isAdmin = session?.rolNombre?.toLowerCase() === 'administrador';
    const isRecepcionista = session?.rolNombre?.toLowerCase() === 'recepcionista';

    if (isAdmin) {
      this.router.navigateByUrl('/admin/usuarios');
      return;
    }

    if (isRecepcionista) {
      this.router.navigateByUrl('/pacientes');
      return;
    }

    const destination = this.returnUrl &&
      this.returnUrl !== '/login' &&
      !this.returnUrl.startsWith('/admin/')
      ? this.returnUrl
      : '/pacientes';

    this.router.navigateByUrl(destination);
  }
}
